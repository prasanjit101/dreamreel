"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip } from '../TimelineClip';
import { TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store.types';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { useTimelineAutoScroll } from '@/hooks/use-timeline-auto-scroll';
import { DragPreview } from './DragPreview';
import { isMediaTypeCompatibleWithTrack, hasTimelineCollision } from '@/utils/timelineUtils';
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
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedMediaFile: null as any,
    dragOverTrack: null as number | null,
    dropPosition: 0,
    isValidDrop: false,
    dragPreview: { x: 0, y: 0, visible: false }
  });

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-scroll hook
  const { handleMouseMove: handleAutoScrollMouseMove, stopAutoScroll } = useTimelineAutoScroll({
    containerRef: timelineContainerRef,
    isActive: dragState.isDragging,
    scrollSpeed: 3,
    edgeThreshold: 60
  });

  // Get timeline container reference from parent
  useEffect(() => {
    if (tracksRef.current) {
      const container = tracksRef.current.closest('.overflow-x-auto') as HTMLDivElement;
      if (container) {
        timelineContainerRef.current = container;
      }
    }
  }, [tracksRef]);

  const calculateDropPosition = (event: React.DragEvent | DragEvent, trackElement: HTMLElement) => {
    const rect = trackElement.getBoundingClientRect();
    const timelineContainer = timelineContainerRef.current;
    
    if (!timelineContainer) return 0;
    
    const containerRect = timelineContainer.getBoundingClientRect();
    const scrollLeft = timelineContainer.scrollLeft;
    const relativeX = event.clientX - containerRect.left + scrollLeft;
    
    return Math.max(0, relativeX / pixelsPerSecond);
  };

  const validateDrop = (mediaType: string, trackNumber: number, position: number, duration: number) => {
    // Check track compatibility
    if (!isMediaTypeCompatibleWithTrack(mediaType, trackNumber)) {
      return false;
    }

    // Check for collisions
    const elementsOnTrack = trackGroups[trackNumber] || [];
    return !hasTimelineCollision({ startTime: position, duration }, elementsOnTrack);
  };

  const handleDragOver = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      const mediaFile = mediaFiles.find(file => file.id === dragData.mediaFileId);
      
      if (!mediaFile) return;

      const position = calculateDropPosition(event, event.currentTarget as HTMLElement);
      const duration = mediaFile.duration || 5;
      const isValid = validateDrop(mediaFile.type, trackNumber, position, duration);

      setDragState(prev => ({
        ...prev,
        isDragging: true,
        draggedMediaFile: mediaFile,
        dragOverTrack: trackNumber,
        dropPosition: position,
        isValidDrop: isValid,
        dragPreview: {
          x: event.clientX,
          y: event.clientY,
          visible: true
        }
      }));

      // Handle auto-scrolling
      handleAutoScrollMouseMove(event.nativeEvent);
    } catch (error) {
      console.error('Error in drag over:', error);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Only clear state if actually leaving the track
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dragOverTrack: null,
        isValidDrop: false
      }));
    }
  };

  const handleDrop = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    stopAutoScroll();

    if (!dragState.isValidDrop || !dragState.draggedMediaFile) {
      toast.error('Invalid drop location');
      setDragState(prev => ({ ...prev, isDragging: false, dragPreview: { ...prev.dragPreview, visible: false } }));
      return;
    }

    try {
      const mediaFile = dragState.draggedMediaFile;
      const position = dragState.dropPosition;

      // Create new timeline element
      const newElement: TimelineElement = {
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: mediaFile.type,
        startTime: position,
        duration: mediaFile.duration || 5,
        track: trackNumber,
        mediaFile,
        properties: {
          volume: (mediaFile.type === 'audio' || mediaFile.type === 'video') ? 1 : undefined
        }
      };

      actions.addTimelineElement(newElement);
      actions.setSelectedElement(newElement.id);
      
      toast.success(`${mediaFile.name} added to timeline`);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to add media to timeline');
    } finally {
      setDragState({
        isDragging: false,
        draggedMediaFile: null,
        dragOverTrack: null,
        dropPosition: 0,
        isValidDrop: false,
        dragPreview: { x: 0, y: 0, visible: false }
      });
    }
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    setDragState({
      isDragging: false,
      draggedMediaFile: null,
      dragOverTrack: null,
      dropPosition: 0,
      isValidDrop: false,
      dragPreview: { x: 0, y: 0, visible: false }
    });
  };

  // Global drag end handler
  useEffect(() => {
    const handleGlobalDragEnd = () => handleDragEnd();
    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => document.removeEventListener('dragend', handleGlobalDragEnd);
  }, []);

  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text';
      case 3: return 'Image';
      default: return `Track ${trackNumber + 1}`;
    }
  };

  const getDropIndicatorPosition = () => {
    if (!dragState.dragOverTrack || !dragState.isDragging) return null;
    
    return {
      left: `${dragState.dropPosition * pixelsPerSecond}px`,
      trackNumber: dragState.dragOverTrack
    };
  };

  const dropIndicator = getDropIndicatorPosition();

  return (
    <>
      <div ref={tracksRef} className="relative z-20">
        {allTrackNumbers.map(trackNumber => (
          <div 
            key={trackNumber} 
            className={`h-12 bg-muted/20 border-b border-border relative transition-all duration-200 ${
              dragState.dragOverTrack === trackNumber 
                ? dragState.isValidDrop 
                  ? 'bg-green-500/10 border-green-500/30 shadow-inner' 
                  : 'bg-red-500/10 border-red-500/30 shadow-inner'
                : 'hover:bg-muted/30'
            }`}
            onDragOver={(e) => handleDragOver(e, trackNumber)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, trackNumber)}
          >
            {/* Drop zone indicator */}
            {dragState.dragOverTrack === trackNumber && dragState.isDragging && (
              <>
                <div className={`absolute inset-0 border-2 border-dashed pointer-events-none z-10 ${
                  dragState.isValidDrop ? 'border-green-500/50' : 'border-red-500/50'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      dragState.isValidDrop 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                        : 'bg-red-500/20 text-red-700 dark:text-red-300'
                    }`}>
                      {dragState.isValidDrop 
                        ? `Drop to add to ${getTrackLabel(trackNumber)}` 
                        : `Cannot drop ${dragState.draggedMediaFile?.type} here`
                      }
                    </span>
                  </div>
                </div>
                
                {/* Position indicator line */}
                {dragState.isValidDrop && dropIndicator && dropIndicator.trackNumber === trackNumber && (
                  <div
                    className="absolute top-0 w-0.5 h-full bg-green-500 z-20 pointer-events-none"
                    style={{ left: dropIndicator.left }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </>
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

      {/* Drag Preview */}
      {dragState.dragPreview.visible && dragState.draggedMediaFile && (
        <DragPreview
          mediaFile={dragState.draggedMediaFile}
          x={dragState.dragPreview.x}
          y={dragState.dragPreview.y}
          width={(dragState.draggedMediaFile.duration || 5) * pixelsPerSecond}
          visible={dragState.dragPreview.visible}
          isValidDrop={dragState.isValidDrop}
        />
      )}
    </>
  );
}