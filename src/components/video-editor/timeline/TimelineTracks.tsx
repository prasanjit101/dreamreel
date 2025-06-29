"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip } from '../TimelineClip';
import { MediaFile, TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store.types';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { useTimelineAutoScroll } from '@/hooks/use-timeline-auto-scroll';
import { DragPreview } from './DragPreview';
import { TimelineDropIndicator } from './TimelineDropIndicator';
import { isMediaTypeCompatibleWithTrack } from '@/utils/timelineUtils';
import { toast } from 'sonner';
import { DropZone, TimelineTracksProps } from './timeline.types';

const EDGE_SNAP_THRESHOLD = 18; // pixels for edge detection
const EDGE_INSERTION_THRESHOLD = 18; // pixels for before/after insertion detection

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
    draggedMediaFile: null as MediaFile | null,
    draggedElement: null as TimelineElement | null,
    dragType: 'new' as 'new' | 'existing',
    dropZone: null as DropZone | null,
    dragPreview: { x: 0, y: 0, visible: false }
  });

  const timelineContainerRef = useRef<HTMLDivElement>(null);

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
    console.log('Finding drop zone:', { trackNumber, position, mediaType, duration, draggedElementId });
    
    // Check track compatibility first
    if (!isMediaTypeCompatibleWithTrack(mediaType, trackNumber)) {
      console.log('Track incompatible:', { mediaType, trackNumber });
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

    console.log('Elements on track:', elementsOnTrack.length);

    // If track is empty, always allow exact placement
    if (elementsOnTrack.length === 0) {
      console.log('Track is empty, allowing exact placement');
      return {
        trackNumber,
        position,
        insertionType: 'exact',
        isValid: true
      };
    }

    // Convert position to pixels for edge detection
    const positionInPixels = position * pixelsPerSecond;

    // Check for edge insertion opportunities
    for (const element of elementsOnTrack) {
      const elementStartPixels = element.startTime * pixelsPerSecond;
      const elementEndPixels = (element.startTime + element.duration) * pixelsPerSecond;

      // Check if we're near the start edge (insert before)
      if (Math.abs(positionInPixels - elementStartPixels) <= EDGE_INSERTION_THRESHOLD) {
        console.log('Insert before element:', element.id);
        return {
          trackNumber,
          position: element.startTime,
          insertionType: 'before',
          isValid: true,
          targetElementId: element.id
        };
      }

      // Check if we're near the end edge (insert after)
      if (Math.abs(positionInPixels - elementEndPixels) <= EDGE_INSERTION_THRESHOLD) {
        console.log('Insert after element:', element.id);
        return {
          trackNumber,
          position: element.startTime + element.duration,
          insertionType: 'after',
          isValid: true,
          targetElementId: element.id
        };
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

    console.log('Collision check:', { hasCollision, position });

    // If no collision and not near edges, allow exact placement
    if (!hasCollision) {
      return {
        trackNumber,
        position,
        insertionType: 'exact',
        isValid: true
      };
    }

    // Find the best insertion point in a gap
    for (let i = 0; i < elementsOnTrack.length - 1; i++) {
      const currentElement = elementsOnTrack[i];
      const nextElement = elementsOnTrack[i + 1];
      const gapStart = currentElement.startTime + currentElement.duration;
      const gapEnd = nextElement.startTime;

      if (position >= gapStart && position + duration <= gapEnd) {
        return {
          trackNumber,
          position,
          insertionType: 'exact',
          isValid: true
        };
      }
    }

    // If we can't place anywhere, return invalid
    return {
      trackNumber,
      position,
      insertionType: 'exact',
      isValid: false
    };
  };

  const parseDragData = (dataTransfer: DataTransfer) => {
    try {
      const jsonData = dataTransfer.getData('application/json');
      
      if (!jsonData || jsonData.trim() === '') {
        console.log('No drag data available');
        return null;
      }
      
      const dragData = JSON.parse(jsonData);
      
      if (!dragData || typeof dragData !== 'object') {
        console.log('Invalid drag data structure:', dragData);
        return null;
      }
      
      console.log('Parsed drag data:', dragData);
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
        console.log('Timeline element not found:', dragData.timelineElementId);
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
        console.log('Media file drop zone:', dropZone);
      } else {
        console.log('Media file not found:', dragData.mediaFileId);
        return;
      }
    } else {
      console.log('Unknown drag data format:', dragData);
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

  const shiftElementsOnTrack = (trackNumber: number, fromStartTime: number, shiftAmount: number, excludeElementId?: string) => {
    const elementsToShift = timelineElements.filter(el =>
      el.track === trackNumber &&
      el.startTime >= fromStartTime &&
      el.id !== excludeElementId
    );

    elementsToShift.forEach(element => {
      actions.updateTimelineElement(element.id, {
        startTime: Math.max(0, element.startTime + shiftAmount)
      });
    });

    console.log(`Shifted ${elementsToShift.length} elements by ${shiftAmount}s on track ${trackNumber}`);
  };

  const handleDrop = (event: React.DragEvent, trackNumber: number) => {
    event.preventDefault();
    stopAutoScroll();

    console.log('Drop event triggered:', { trackNumber, dragState });

    const dragData = parseDragData(event.dataTransfer);
    if (!dragData) {
      console.log('No valid drag data on drop');
      toast.error('Invalid drag data');
      handleDragEnd();
      return;
    }

    // Recalculate drop zone for final validation
    const position = calculateDropPosition(event, event.currentTarget as HTMLElement);
    let finalDropZone: DropZone;
    
    if (dragData.timelineElementId) {
      // Moving existing timeline element
      const element = timelineElements.find(el => el.id === dragData.timelineElementId);
      if (!element) {
        console.log('Timeline element not found for drop');
        toast.error('Element not found');
        handleDragEnd();
        return;
      }
      
      finalDropZone = findDropZone(
        trackNumber, 
        position, 
        element.type, 
        element.duration, 
        element.id
      );
      
      if (!finalDropZone.isValid) {
        toast.error('Cannot drop here - invalid location');
        handleDragEnd();
        return;
      }

      console.log('Moving existing element:', {
        elementId: element.id,
        insertionType: finalDropZone.insertionType,
        newStartTime: finalDropZone.position,
        trackNumber
      });

      // Handle different insertion types
      if (finalDropZone.insertionType === 'before' && finalDropZone.targetElementId) {
        // Insert before: place element at target position, shift target and subsequent elements right
        const targetElement = timelineElements.find(el => el.id === finalDropZone.targetElementId);
        if (targetElement) {
          shiftElementsOnTrack(trackNumber, targetElement.startTime, element.duration, element.id);
        }
      } else if (finalDropZone.insertionType === 'after' && finalDropZone.targetElementId) {
        // Insert after: place element after target, shift subsequent elements right if needed
        shiftElementsOnTrack(trackNumber, finalDropZone.position, element.duration, element.id);
      }
      
      // Update the element's position and track
      actions.updateTimelineElement(element.id, {
        startTime: finalDropZone.position,
        track: trackNumber
      });
      
      const insertionTypeText = finalDropZone.insertionType === 'before' ? 'inserted before' :
        finalDropZone.insertionType === 'after' ? 'inserted after' : 'repositioned';
      toast.success(`${element.mediaFile?.name || 'Element'} ${insertionTypeText}`);
      
    } else if (dragData.mediaFileId) {
      // Adding new media file
      const mediaFile = mediaFiles.find(file => file.id === dragData.mediaFileId);
      if (!mediaFile) {
        console.log('Media file not found for drop');
        toast.error('Media file not found');
        handleDragEnd();
        return;
      }
      
      finalDropZone = findDropZone(
        trackNumber, 
        position, 
        mediaFile.type, 
        mediaFile.duration || 5
      );
      
      if (!finalDropZone.isValid) {
        toast.error('Cannot drop here - invalid location');
        handleDragEnd();
        return;
      }

      console.log('Adding new media file:', {
        mediaFileId: mediaFile.id,
        insertionType: finalDropZone.insertionType,
        newStartTime: finalDropZone.position,
        trackNumber
      });

      const newElementDuration = mediaFile.duration || 5;

      // Handle different insertion types for new media
      if (finalDropZone.insertionType === 'before' && finalDropZone.targetElementId) {
        // Insert before: place element at target position, shift target and subsequent elements right
        const targetElement = timelineElements.find(el => el.id === finalDropZone.targetElementId);
        if (targetElement) {
          shiftElementsOnTrack(trackNumber, targetElement.startTime, newElementDuration);
        }
      } else if (finalDropZone.insertionType === 'after' && finalDropZone.targetElementId) {
        // Insert after: place element after target, shift subsequent elements right if needed
        shiftElementsOnTrack(trackNumber, finalDropZone.position, newElementDuration);
      }

      const newElement: TimelineElement = {
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: mediaFile.type,
        startTime: finalDropZone.position,
        duration: newElementDuration,
        track: trackNumber,
        mediaFile,
        properties: {
          volume: (mediaFile.type === 'audio' || mediaFile.type === 'video') ? 1 : undefined
        }
      };

      actions.addTimelineElement(newElement);
      actions.setSelectedElement(newElement.id);
      
      const insertionTypeText = finalDropZone.insertionType === 'before' ? 'inserted before existing item' :
        finalDropZone.insertionType === 'after' ? 'inserted after existing item' : 'added';
      toast.success(`${mediaFile.name} ${insertionTypeText}`);
    } else {
      console.log('Unknown drag data format on drop');
      toast.error('Invalid drop operation');
    }

    handleDragEnd();
  };

  const handleDragEnd = () => {
    console.log('Drag operation ended');
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
      <div ref={tracksRef} className="relative overflow-y-auto z-20">
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