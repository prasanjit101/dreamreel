"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineElement, MediaFile } from '@/lib/store/video-editor-store.types';
import { isMediaTypeCompatibleWithTrack, hasTimelineCollision } from '@/utils/timelineUtils';
import { toast } from 'sonner';

interface DragState {
  isDragging: boolean;
  draggedItem: MediaFile | null;
  dragPreview: {
    x: number;
    y: number;
    width: number;
    visible: boolean;
  };
  dropTarget: {
    trackNumber: number | null;
    position: number | null;
    isValid: boolean;
  };
}

interface UseDragAndDropProps {
  timelineContainerRef: React.RefObject<HTMLDivElement>;
  pixelsPerSecond: number;
  trackHeight: number;
}

export const useDragAndDrop = ({
  timelineContainerRef,
  pixelsPerSecond,
  trackHeight
}: UseDragAndDropProps) => {
  const { mediaFiles, timelineElements, actions } = useVideoEditorStore();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragPreview: { x: 0, y: 0, width: 0, visible: false },
    dropTarget: { trackNumber: null, position: null, isValid: false }
  });

  const dragStartPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const startDrag = useCallback((mediaFile: MediaFile, event: React.DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dragStartPositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: mediaFile,
      dragPreview: {
        x: event.clientX,
        y: event.clientY,
        width: Math.max(200, (mediaFile.duration || 5) * pixelsPerSecond),
        visible: true
      }
    }));

    // Set drag data for native drag and drop
    event.dataTransfer.setData('application/json', JSON.stringify({
      mediaFileId: mediaFile.id,
      mediaType: mediaFile.type
    }));
    event.dataTransfer.effectAllowed = 'copy';
  }, [pixelsPerSecond]);

  const updateDragPreview = useCallback((event: DragEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      dragPreview: {
        ...prev.dragPreview,
        x: event.clientX - dragStartPositionRef.current.x,
        y: event.clientY - dragStartPositionRef.current.y
      }
    }));
  }, [dragState.isDragging]);

  const updateDropTarget = useCallback((event: DragEvent, trackNumber?: number) => {
    if (!dragState.isDragging || !dragState.draggedItem || !timelineContainerRef.current) return;

    let targetTrack = trackNumber;
    let position = 0;
    let isValid = false;

    if (targetTrack !== undefined) {
      // Calculate position within the timeline
      const timelineRect = timelineContainerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - timelineRect.left + timelineContainerRef.current.scrollLeft;
      position = Math.max(0, relativeX / pixelsPerSecond);

      // Check if media type is compatible with track
      isValid = isMediaTypeCompatibleWithTrack(dragState.draggedItem.type, targetTrack);

      // Check for collisions if valid
      if (isValid) {
        const elementsOnTrack = timelineElements.filter(el => el.track === targetTrack);
        const duration = dragState.draggedItem.duration || 5;
        
        isValid = !hasTimelineCollision(
          { startTime: position, duration },
          elementsOnTrack
        );
      }
    }

    setDragState(prev => ({
      ...prev,
      dropTarget: {
        trackNumber: targetTrack ?? null,
        position,
        isValid
      }
    }));
  }, [dragState.isDragging, dragState.draggedItem, timelineContainerRef, pixelsPerSecond, timelineElements]);

  const completeDrop = useCallback((event: DragEvent, trackNumber: number) => {
    if (!dragState.isDragging || !dragState.draggedItem || !dragState.dropTarget.isValid) {
      toast.error('Drop failed: Invalid drop location');
      return false;
    }

    try {
      const mediaFile = dragState.draggedItem;
      const position = dragState.dropTarget.position || 0;

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
      return true;
    } catch (error) {
      console.error('Error completing drop:', error);
      toast.error('Failed to add media to timeline');
      return false;
    }
  }, [dragState, actions]);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragPreview: { x: 0, y: 0, width: 0, visible: false },
      dropTarget: { trackNumber: null, position: null, isValid: false }
    });
  }, []);

  // Global mouse move handler for drag preview
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('dragover', updateDragPreview);
      return () => {
        document.removeEventListener('dragover', updateDragPreview);
      };
    }
  }, [dragState.isDragging, updateDragPreview]);

  return {
    dragState,
    startDrag,
    updateDropTarget,
    completeDrop,
    endDrag
  };
};