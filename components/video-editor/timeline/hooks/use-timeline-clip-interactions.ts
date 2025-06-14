"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoEditorStore, TimelineElement } from '@/lib/store/video-editor-store';
import { 
  findNearestSnap, 
  getSnapPoints, 
  checkCollision, 
  findValidPosition 
} from '@/utils/timelineUtils';

interface UseTimelineClipInteractionsProps {
  element: TimelineElement;
  duration: number;
  pixelsPerSecond: number;
  allElements: TimelineElement[];
  onSelect: (id: string) => void;
  clipRef: React.RefObject<HTMLDivElement | null>;
}

interface UseTimelineClipInteractionsReturn {
  isDragging: boolean;
  isResizing: 'left' | 'right' | null;
  snapIndicator: { position: number; visible: boolean };
  handleMouseDown: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  handleMouseDownLeftResize: (e: React.MouseEvent) => void;
  handleMouseDownRightResize: (e: React.MouseEvent) => void;
}

export const useTimelineClipInteractions = ({
  element,
  duration,
  pixelsPerSecond,
  allElements,
  onSelect,
  clipRef,
}: UseTimelineClipInteractionsProps): UseTimelineClipInteractionsReturn => {
  const { actions, snapToGrid, snapToElements } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, startTime: 0, duration: 0 });
  const [snapIndicator, setSnapIndicator] = useState<{ position: number; visible: boolean }>({ 
    position: 0, 
    visible: false 
  });

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(element.id);
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const handleWidth = Math.max(8, 12);

    // Check if clicking on resize handles
    if (relativeX <= handleWidth) {
      setIsResizing('left');
      setResizeStart({
        x: e.clientX,
        startTime: element.startTime,
        duration: element.duration
      });
    } else if (relativeX >= rect.width - handleWidth) {
      setIsResizing('right');
      setResizeStart({
        x: e.clientX,
        startTime: element.startTime,
        duration: element.duration
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        startTime: element.startTime
      });
    }
  }, [element, onSelect, clipRef]);

  const handleMouseDownLeftResize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    setIsResizing('left');
    setResizeStart({
      x: e.clientX,
      startTime: element.startTime,
      duration: element.duration
    });
  }, [element, onSelect]);

  const handleMouseDownRightResize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    setIsResizing('right');
    setResizeStart({
      x: e.clientX,
      startTime: element.startTime,
      duration: element.duration
    });
  }, [element, onSelect]);

  // Enhanced mouse move handling with improved snapping and collision detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const snapPoints = getSnapPoints(duration, allElements, element.id, snapToGrid, snapToElements);
      
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaTime = deltaX / pixelsPerSecond;
        let newStartTime = Math.max(0, dragStart.startTime + deltaTime);
        
        // Apply snapping to start time
        const snapStart = findNearestSnap(newStartTime, snapPoints, pixelsPerSecond);
        if (snapStart !== null) {
          newStartTime = snapStart;
          setSnapIndicator({ position: snapStart * pixelsPerSecond, visible: true });
        } else {
          setSnapIndicator({ position: 0, visible: false });
        }
        
        // Ensure clip doesn't go beyond timeline duration
        newStartTime = Math.min(newStartTime, duration - element.duration);
        
        // Use enhanced collision detection
        if (!checkCollision(element, newStartTime, element.duration, allElements)) {
          actions.updateTimelineElement(element.id, {
            startTime: newStartTime
          });
        } else {
          // Find the nearest valid position
          const validPosition = findValidPosition(element, newStartTime, allElements, duration);
          if (validPosition !== element.startTime) {
            actions.updateTimelineElement(element.id, {
              startTime: validPosition
            });
          }
        }
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaTime = deltaX / pixelsPerSecond;

        if (isResizing === 'left') {
          // Resize from left (trim start)
          let newStartTime = resizeStart.startTime + deltaTime;
          let newDuration = resizeStart.duration - deltaTime;
          
          // Apply snapping to start time
          const snapStart = findNearestSnap(newStartTime, snapPoints, pixelsPerSecond);
          if (snapStart !== null) {
            newDuration = resizeStart.duration - (snapStart - resizeStart.startTime);
            newStartTime = snapStart;
            setSnapIndicator({ position: snapStart * pixelsPerSecond, visible: true });
          } else {
            setSnapIndicator({ position: 0, visible: false });
          }
          
          // Constraints
          newStartTime = Math.max(0, newStartTime);
          newDuration = Math.max(0.1, newDuration);
          
          // Enhanced collision check
          if (!checkCollision(element, newStartTime, newDuration, allElements)) {
            actions.updateTimelineElement(element.id, {
              startTime: newStartTime,
              duration: newDuration
            });
          }
        } else if (isResizing === 'right') {
          // Resize from right (trim end)
          let newDuration = resizeStart.duration + deltaTime;
          const newEndTime = element.startTime + newDuration;
          
          // Apply snapping to end time
          const snapEnd = findNearestSnap(newEndTime, snapPoints, pixelsPerSecond);
          if (snapEnd !== null) {
            newDuration = snapEnd - element.startTime;
            setSnapIndicator({ position: snapEnd * pixelsPerSecond, visible: true });
          } else {
            setSnapIndicator({ position: 0, visible: false });
          }
          
          // Constraints
          newDuration = Math.max(0.1, newDuration);
          
          // Enhanced collision check
          if (!checkCollision(element, element.startTime, newDuration, allElements)) {
            actions.updateTimelineElement(element.id, {
              duration: newDuration
            });
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      setSnapIndicator({ position: 0, visible: false });
      
      // Reset cursor
      document.body.style.cursor = '';
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Set appropriate cursor
      if (isDragging) {
        document.body.style.cursor = 'grabbing';
      } else if (isResizing) {
        document.body.style.cursor = 'ew-resize';
      }
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [
    isDragging, 
    isResizing, 
    dragStart, 
    resizeStart, 
    element, 
    duration, 
    pixelsPerSecond, 
    actions, 
    allElements,
    snapToGrid,
    snapToElements
  ]);

  // Enhanced double-click to split clip
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clipWidth = Math.max(element.duration * pixelsPerSecond, 20);
    const relativeX = e.clientX - rect.left;
    const splitTime = (relativeX / clipWidth) * element.duration;
    
    // Ensure minimum clip duration of 0.5 seconds
    if (splitTime > 0.5 && splitTime < element.duration - 0.5) {
      // Create two new clips
      const firstClip = {
        ...element,
        id: `${element.id}_split1_${Date.now()}`,
        duration: splitTime
      };
      
      const secondClip = {
        ...element,
        id: `${element.id}_split2_${Date.now()}`,
        startTime: element.startTime + splitTime,
        duration: element.duration - splitTime
      };
      
      // Remove original and add split clips
      actions.removeTimelineElement(element.id);
      actions.addTimelineElement(firstClip);
      actions.addTimelineElement(secondClip);
      
      // Select the first clip
      onSelect(firstClip.id);
    }
  }, [element, pixelsPerSecond, actions, clipRef, onSelect]);

  return {
    isDragging,
    isResizing,
    snapIndicator,
    handleMouseDown,
    handleDoubleClick,
    handleMouseDownLeftResize,
    handleMouseDownRightResize,
  };
};