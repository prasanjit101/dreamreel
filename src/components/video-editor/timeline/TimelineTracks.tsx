"use client";

import React, { useState } from 'react';
import { TimelineClip } from '../TimelineClip';
import { TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store.types';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { toast } from 'sonner';

interface TimelineTracksProps {
  allTrackNumbers: number[];
  trackGroups: Record<number, TimelineElement[]>;
  timelineElements: TimelineElement[];
  duration: number;
  trackHeight: number;
  pixelsPerSecond: number;
  selectedElementId: string | null;
  actions: VideoEditorState['actions'];
  tracksRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

export function TimelineTracks({
  allTrackNumbers,
  trackGroups,
  timelineElements,
  duration,
  trackHeight,
  pixelsPerSecond,
  selectedElementId,
  actions,
  tracksRef,
  zoom,
}: TimelineTracksProps) {
  const { mediaFiles } = useVideoEditorStore();
  const [dragOverTrack, setDragOverTrack] = useState<number | null>(null);

  const handleDragOver = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverTrack(trackNumber);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear drag over state if we're actually leaving the track area
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTrack(null);
    }
  };

  const handleDrop = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    setDragOverTrack(null);

    try {
      // Get the dropped data
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      const { mediaFileId, mediaType } = dragData;

      // Find the media file
      const mediaFile = mediaFiles.find(file => file.id === mediaFileId);
      if (!mediaFile) {
        toast.error('Media file not found');
        return;
      }

      // Calculate the drop position in time
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const startTime = Math.max(0, x / pixelsPerSecond);

      // Check if the media type is appropriate for the track
      const isValidDrop = (
        (trackNumber === 0 && mediaType === 'video') ||
        (trackNumber === 1 && mediaType === 'audio') ||
        (trackNumber === 2 && mediaType === 'text') ||
        (trackNumber === 3 && mediaType === 'image') ||
        trackNumber > 3 // Allow any type on custom tracks
      );

      if (!isValidDrop) {
        const trackNames = ['Video', 'Audio', 'Text', 'Image'];
        const trackName = trackNumber < 4 ? trackNames[trackNumber] : `Track ${trackNumber + 1}`;
        toast.error(`Cannot add ${mediaType} to ${trackName} track`);
        return;
      }

      // Check for collisions with existing elements on the same track
      const existingElements = trackGroups[trackNumber] || [];
      const elementDuration = mediaFile.duration || 5;
      const elementEndTime = startTime + elementDuration;

      const hasCollision = existingElements.some(element => {
        const elementStart = element.startTime;
        const elementEnd = element.startTime + element.duration;
        return (
          (startTime >= elementStart && startTime < elementEnd) ||
          (elementEndTime > elementStart && elementEndTime <= elementEnd) ||
          (startTime <= elementStart && elementEndTime >= elementEnd)
        );
      });

      if (hasCollision) {
        toast.error('Cannot drop here - overlaps with existing element');
        return;
      }

      // Create the new timeline element
      const newElement: TimelineElement = {
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: mediaType,
        startTime,
        duration: elementDuration,
        track: trackNumber,
        mediaFile,
        properties: {
          volume: (mediaType === 'audio' || mediaType === 'video') ? 1 : undefined
        }
      };

      // Add the element to the timeline
      actions.addTimelineElement(newElement);
      actions.setSelectedElement(newElement.id);
      
      toast.success(`${mediaFile.name} added to timeline`);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to add media to timeline');
    }
  };

  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text';
      case 3: return 'Image';
      default: return `Track ${trackNumber + 1}`;
    }
  };

  return (
    <div ref={tracksRef} className="relative z-20">
      {allTrackNumbers.map(trackNumber => (
        <div 
          key={trackNumber} 
          className={`h-12 bg-muted/20 border-b border-border relative transition-colors ${
            dragOverTrack === trackNumber ? 'bg-primary/10 border-primary/30' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, trackNumber)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, trackNumber)}
        >
          {/* Drop zone indicator */}
          {dragOverTrack === trackNumber && (
            <div className="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center z-10 pointer-events-none">
              <span className="text-primary text-sm font-medium">
                Drop to add to {getTrackLabel(trackNumber)} track
              </span>
            </div>
          )}
          
          {/* Existing timeline elements */}
          {(trackGroups[trackNumber] || []).map(element => (
            <TimelineClip
              key={element.id}
              element={element}
              duration={duration}
              trackHeight={trackHeight}
              pixelsPerSecond={pixelsPerSecond}
              trackIndex={trackNumber}
              onSelect={actions.setSelectedElement}
              isSelected={selectedElementId === element.id}
              allElements={timelineElements}
              zoom={zoom}
            />
          ))}
        </div>
      ))}
    </div>
  );
}