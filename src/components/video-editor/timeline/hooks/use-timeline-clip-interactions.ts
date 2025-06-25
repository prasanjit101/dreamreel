"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineElement } from '@/lib/store/video-editor-store.types';
import { findNearestSnap, getSnapPoints } from '@/utils/timelineUtils';

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
  const { actions } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, startTime: 0, duration: 0 });
  const [snapIndicator, setSnapIndicator] = useState<{ position: number; visible: boolean }>({ position: 0, visible: false });

  // Handle mouse down for dragging and resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(element.id);
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const handleWidth = Math.max(8, 12 / (pixelsPerSecond / 100)); // Approximation for zoom, adjust as needed

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
  }, [element, onSelect, clipRef, pixelsPerSecond]);

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

  // Handle mouse move for dragging and resizing with snapping
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const snapPoints = getSnapPoints(duration, allElements, element.id);
      
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
        
        // Check for collisions with other clips on the same track
        const wouldCollide = allElements.some(el => 
          el.id !== element.id && 
          el.track === element.track &&
          newStartTime < el.startTime + el.duration &&
          newStartTime + element.duration > el.startTime
        );
        
        if (!wouldCollide) {
          actions.updateTimelineElement(element.id, {
            startTime: newStartTime
          });
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
          
          // Check for collisions
          const wouldCollide = allElements.some(el => 
            el.id !== element.id && 
            el.track === element.track &&
            newStartTime < el.startTime + el.duration &&
            newStartTime + newDuration > el.startTime
          );
          
          if (!wouldCollide) {
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
          newDuration = Math.min(newDuration, duration - element.startTime);
          
          // Check for collisions
          const wouldCollide = allElements.some(el => 
            el.id !== element.id && 
            el.track === element.track &&
            element.startTime < el.startTime + el.duration &&
            element.startTime + newDuration > el.startTime
          );
          
          if (!wouldCollide) {
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
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, element, duration, pixelsPerSecond, actions, allElements]);

  // Handle double-click to split clip
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clipWidth = Math.max(element.duration * pixelsPerSecond, 20);
    const relativeX = e.clientX - rect.left;
    const splitTime = (relativeX / clipWidth) * element.duration;
    
    if (splitTime > 0.1 && splitTime < element.duration - 0.1) {
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
    }
  }, [element, pixelsPerSecond, actions, clipRef]);

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
