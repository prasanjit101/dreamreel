"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip } from '../TimelineClip';
import { MediaFile, TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store.types';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { useTimelineAutoScroll } from '@/hooks/use-timeline-auto-scroll';
import { DragPreview } from './DragPreview';
import { TimelineDropIndicator } from './TimelineDropIndicator';
import { isMediaTypeCompatibleWithTrack, hasTimelineCollision } from '@/utils/timelineUtils';
import { toast } from 'sonner';
import { DropZone, TimelineTracksProps } from './timeline.types';


const EDGE_SNAP_THRESHOLD = 18; // pixels for edge detection
const POSITION_SNAP_THRESHOLD = 10; // pixels for position snapping

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
    draggedElement: null as TimelineElement | null,
    dragType: 'new' as 'new' | 'existing',
    dropZone: null as DropZone | null,
    dragPreview: { x: 0, y: 0, visible: false }
  });

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-scroll hook
  const { handleMouseMove: handleAutoScrollMouseMove, stopAutoScroll } = useTimelineAutoScroll({
    containerRef: timelineContainerRef as React.RefObject<HTMLDivElement>,
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

  const findDropZone = (
    trackNumber: number, 
    position: number, 
    mediaType: string, 
    duration: number,
    draggedElementId?: string
  ): DropZone => {
    // Check track compatibility
    if (!isMediaTypeCompatibleWithTrack(mediaType, trackNumber)) {
      return {
        trackNumber,
        position,
        insertionType: 'exact',
        isValid: false
      };
    }

    const elementsOnTrack = (trackGroups[trackNumber] || [])
      .filter(el => el.id !== draggedElementId) // Exclude the dragged element
      .sort((a, b) => a.startTime - b.startTime);

    if (elementsOnTrack.length === 0) {
      return {
        trackNumber,
        position,
        insertionType: 'exact',
        isValid: true
      };
    }

    // Find the best insertion point
    for (const element of elementsOnTrack) {
      const elementStart = element.startTime * pixelsPerSecond;
      const elementEnd = (element.startTime + element.duration) * pixelsPerSecond;
      const positionPx = position * pixelsPerSecond;

      // Check if near the start edge
      if (Math.abs(positionPx - elementStart) <= EDGE_SNAP_THRESHOLD) {
        const insertPosition = element.startTime - duration;
        if (insertPosition >= 0) {
          // Check if there's space before this element
          const prevElement = elementsOnTrack.find(el => 
            el.startTime + el.duration <= element.startTime && 
            el.startTime + el.duration > insertPosition
          );
          
          if (!prevElement) {
            return {
              trackNumber,
              position: Math.max(0, insertPosition),
              insertionType: 'before',
              targetElementId: element.id,
              isValid: true
            };
          }
        }
      }

      // Check if near the end edge
      if (Math.abs(positionPx - elementEnd) <= EDGE_SNAP_THRESHOLD) {
        const insertPosition = element.startTime + element.duration;
        
        // Check if there's space after this element
        const nextElement = elementsOnTrack.find(el => 
          el.startTime >= insertPosition && 
          el.startTime < insertPosition + duration
        );
        
        if (!nextElement) {
          return {
            trackNumber,
            position: insertPosition,
            insertionType: 'after',
            targetElementId: element.id,
            isValid: true
          };
        }
      }
    }

    // Check for exact position placement (no collision)
    const hasCollision = elementsOnTrack.some(element => {
      const elementStart = element.startTime;
      const elementEnd = element.startTime + element.duration;
      const newStart = position;
      const newEnd = position + duration;
      
      return (
        (newStart >= elementStart && newStart < elementEnd) ||
        (newEnd > elementStart && newEnd <= elementEnd) ||
        (newStart <= elementStart && newEnd >= elementEnd)
      );
    });

    return {
      trackNumber,
      position,
      insertionType: 'exact',
      isValid: !hasCollision
    };
  };

  const parseDragData = (dataTransfer: DataTransfer) => {
    try {
      const jsonData = dataTransfer.getData('application/json');
      
      if (!jsonData || jsonData.trim() === '') {
        return null;
      }
      
      const dragData = JSON.parse(jsonData);
      
      if (!dragData || typeof dragData !== 'object') {
        return null;
      }
      
      return dragData;
    } catch (error) {
      console.warn('Failed to parse drag data:', error);
      return null;
    }
  };

  const handleDragOver = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

    const dragData = parseDragData(event.dataTransfer);
    if (!dragData) {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        dropZone: null
      }));
      return;
    }

    const position = calculateDropPosition(event, event.currentTarget as HTMLElement);
    let dropZone: DropZone;
    let draggedItem = null;
    let dragType: 'new' | 'existing' = 'new';

    // Check if it's an existing timeline element being dragged
    if (dragData.timelineElementId) {
      const element = timelineElements.find(el => el.id === dragData.timelineElementId);
      if (element) {
        draggedItem = element;
        dragType = 'existing';
        dropZone = findDropZone(trackNumber, position, element.type, element.duration, element.id);
      } else {
        return;
      }
    } else if (dragData.mediaFileId) {
      // New media file from files panel
      const mediaFile = mediaFiles.find(file => file.id === dragData.mediaFileId);
      if (mediaFile) {
        draggedItem = mediaFile;
        dragType = 'new';
        const duration = mediaFile.duration || 5;
        dropZone = findDropZone(trackNumber, position, mediaFile.type, duration);
      } else {
        return;
      }
    } else {
      return;
    }

    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedMediaFile: dragType === 'new' ? draggedItem as MediaFile : null,
      draggedElement: dragType === 'existing' ? draggedItem as TimelineElement : null,
      dragType,
      dropZone,
      dragPreview: {
        x: event.clientX,
        y: event.clientY,
        visible: true
      }
    }));

    handleAutoScrollMouseMove(event.nativeEvent);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropZone: null
      }));
    }
  };

  const handleDrop = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    stopAutoScroll();

    const dragData = parseDragData(event.dataTransfer);
    if (!dragData || !dragState.dropZone?.isValid) {
      toast.error('Timeline: Invalid drop location');
      setDragState(prev => ({ 
        ...prev, 
        isDragging: false, 
        dragPreview: { ...prev.dragPreview, visible: false },
        dropZone: null
      }));
      return;
    }

    try {
      if (dragState.dragType === 'existing' && dragState.draggedElement) {
        // Moving existing timeline element
        const element = dragState.draggedElement;
        const newStartTime = dragState.dropZone.position;
        
        // Update the element's position and track
        actions.updateTimelineElement(element.id, {
          startTime: newStartTime,
          track: trackNumber
        });
        
        toast.success(`${element.mediaFile?.name || 'Element'} repositioned`);
      } else if (dragState.dragType === 'new' && dragState.draggedMediaFile) {
        // Adding new media file
        const mediaFile = dragState.draggedMediaFile;
        const newStartTime = dragState.dropZone.position;

        const newElement: TimelineElement = {
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: mediaFile.type,
          startTime: newStartTime,
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
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to process drop operation');
    } finally {
      setDragState({
        isDragging: false,
        draggedMediaFile: null,
        draggedElement: null,
        dragType: 'new',
        dropZone: null,
        dragPreview: { x: 0, y: 0, visible: false }
      });
    }
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    setDragState({
      isDragging: false,
      draggedMediaFile: null,
      draggedElement: null,
      dragType: 'new',
      dropZone: null,
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

  return (
    <>
      <div ref={tracksRef} className="relative z-20">
        {allTrackNumbers.map(trackNumber => (
          <div 
            key={trackNumber} 
            className={`h-12 bg-muted/20 border-b border-border relative transition-all duration-200 ${
              dragState.dropZone?.trackNumber === trackNumber 
                ? dragState.dropZone.isValid 
                  ? 'bg-green-500/10 border-green-500/30 shadow-inner' 
                  : 'bg-red-500/10 border-red-500/30 shadow-inner'
                : 'hover:bg-muted/30'
            }`}
            onDragOver={(e) => handleDragOver(e, trackNumber)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, trackNumber)}
          >
            {/* Drop zone indicator */}
            {dragState.dropZone?.trackNumber === trackNumber && dragState.isDragging && (
              <TimelineDropIndicator
                dropZone={dragState.dropZone}
                pixelsPerSecond={pixelsPerSecond}
                trackLabel={getTrackLabel(trackNumber)}
                draggedItem={dragState.draggedMediaFile || dragState.draggedElement}
              />
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
                isDraggedElement={dragState.draggedElement?.id === element.id}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Drag Preview */}
      {dragState.dragPreview.visible && (dragState.draggedMediaFile || dragState.draggedElement) && (
        <DragPreview
          mediaFile={dragState.draggedMediaFile || (dragState.draggedElement?.mediaFile)}
          element={dragState.draggedElement ?? undefined}
          x={dragState.dragPreview.x}
          y={dragState.dragPreview.y}
          width={((dragState.draggedMediaFile?.duration || dragState.draggedElement?.duration || 5) * pixelsPerSecond)}
          visible={dragState.dragPreview.visible}
          isValidDrop={dragState.dropZone?.isValid || false}
          dragType={dragState.dragType}
        />
      )}
    </>
  );
}