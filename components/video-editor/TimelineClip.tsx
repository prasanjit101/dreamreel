"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useVideoEditorStore, TimelineElement } from '@/lib/store/video-editor-store';
import { formatDuration } from '@/utils/mediaUtils';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Type, Image, Video, Music } from 'lucide-react';

interface TimelineClipProps {
  element: TimelineElement;
  duration: number;
  trackHeight: number;
  pixelsPerSecond: number;
  trackIndex: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
  allElements: TimelineElement[];
  zoom: number;
}

export function TimelineClip({
  element,
  duration,
  trackHeight,
  pixelsPerSecond,
  trackIndex,
  onSelect,
  isSelected,
  allElements,
  zoom
}: TimelineClipProps) {
  const { actions } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, startTime: 0, duration: 0 });
  const [snapIndicator, setSnapIndicator] = useState<{ position: number; visible: boolean }>({ position: 0, visible: false });
  const clipRef = useRef<HTMLDivElement>(null);

  const clipWidth = Math.max(element.duration * pixelsPerSecond, 20);
  const clipLeft = element.startTime * pixelsPerSecond;

  // Snapping configuration
  const SNAP_THRESHOLD = 10; // pixels
  const SNAP_TO_GRID = true; // snap to second intervals
  const GRID_INTERVAL = 1; // seconds

  // Calculate snap points from other elements and grid
  const getSnapPoints = () => {
    const snapPoints: number[] = [];
    
    // Add grid snap points (every second)
    if (SNAP_TO_GRID) {
      for (let i = 0; i <= Math.ceil(duration); i += GRID_INTERVAL) {
        snapPoints.push(i);
      }
    }
    
    // Add snap points from other elements (excluding current element)
    allElements.forEach(el => {
      if (el.id !== element.id) {
        snapPoints.push(el.startTime); // Start of other clips
        snapPoints.push(el.startTime + el.duration); // End of other clips
      }
    });
    
    return snapPoints.sort((a, b) => a - b);
  };

  // Find nearest snap point
  const findNearestSnap = (time: number, snapPoints: number[]) => {
    let nearestSnap = null;
    let minDistance = Infinity;
    
    snapPoints.forEach(snapPoint => {
      const distance = Math.abs(time - snapPoint);
      const pixelDistance = distance * pixelsPerSecond;
      
      if (pixelDistance <= SNAP_THRESHOLD && distance < minDistance) {
        minDistance = distance;
        nearestSnap = snapPoint;
      }
    });
    
    return nearestSnap;
  };

  // Get clip color based on type
  const getClipColor = () => {
    switch (element.type) {
      case 'video':
        return 'bg-blue-500/80 border-blue-400 hover:bg-blue-500/90';
      case 'audio':
        return 'bg-green-500/80 border-green-400 hover:bg-green-500/90';
      case 'image':
        return 'bg-purple-500/80 border-purple-400 hover:bg-purple-500/90';
      case 'text':
        return 'bg-orange-500/80 border-orange-400 hover:bg-orange-500/90';
      default:
        return 'bg-gray-500/80 border-gray-400 hover:bg-gray-500/90';
    }
  };

  // Get icon for clip type
  const getClipIcon = () => {
    switch (element.type) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'audio':
        return <Music className="w-3 h-3" />;
      case 'image':
        return <Image className="w-3 h-3" />;
      case 'text':
        return <Type className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Handle mouse down for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(element.id);
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const handleWidth = Math.max(8, 12 / zoom); // Adjust handle size based on zoom

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
  };

  // Handle mouse move for dragging and resizing with snapping
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const snapPoints = getSnapPoints();
      
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaTime = deltaX / pixelsPerSecond;
        let newStartTime = Math.max(0, dragStart.startTime + deltaTime);
        
        // Apply snapping to start time
        const snapStart = findNearestSnap(newStartTime, snapPoints);
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
          const snapStart = findNearestSnap(newStartTime, snapPoints);
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
          const snapEnd = findNearestSnap(newEndTime, snapPoints);
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
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;
    
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
  };

  const handleWidth = Math.max(8, 12 / zoom);

  return (
    <>
      {/* Snap indicator */}
      {snapIndicator.visible && (
        <div
          className="absolute top-0 w-0.5 h-full bg-yellow-400 z-30 pointer-events-none"
          style={{ left: `${snapIndicator.position}px` }}
        />
      )}
      
      <div
        ref={clipRef}
        className={cn(
          'absolute rounded border-2 flex items-center px-2 cursor-move select-none transition-all duration-75',
          getClipColor(),
          isSelected && 'ring-2 ring-white ring-opacity-50 shadow-lg',
          isDragging && 'opacity-80 scale-105 z-30 shadow-xl',
          isResizing && 'opacity-80 z-30 shadow-xl',
          'hover:shadow-md'
        )}
        style={{
          left: `${clipLeft}px`,
          width: `${clipWidth}px`,
          height: `${trackHeight - 8}px`,
          top: '4px'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`${element.mediaFile?.name || element.properties?.text || element.type} - Double-click to split`}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bg-white/40 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
          style={{ 
            width: `${handleWidth}px`,
            height: '100%',
            borderRadius: '2px 0 0 2px'
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing('left');
            setResizeStart({
              x: e.clientX,
              startTime: element.startTime,
              duration: element.duration
            });
          }}
        >
          <div className="w-0.5 h-4 bg-white/80 rounded"></div>
        </div>

        {/* Clip content */}
        <div className="flex items-center gap-1 text-white text-xs truncate flex-1 min-w-0 pointer-events-none">
          {getClipIcon()}
          <span className="truncate font-medium">
            {element.mediaFile?.name || element.properties?.text || `${element.type} element`}
          </span>
          
          {/* Volume indicator for audio/video */}
          {(element.type === 'audio' || element.type === 'video') && (
            <div className="ml-auto flex items-center gap-1">
              {element.properties?.volume === 0 ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </div>
          )}
        </div>

        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bg-white/40 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
          style={{ 
            width: `${handleWidth}px`,
            height: '100%',
            borderRadius: '0 2px 2px 0'
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing('right');
            setResizeStart({
              x: e.clientX,
              startTime: element.startTime,
              duration: element.duration
            });
          }}
        >
          <div className="w-0.5 h-4 bg-white/80 rounded"></div>
        </div>

        {/* Duration indicator */}
        {clipWidth > 60 && (
          <div className="absolute bottom-0 right-1 text-white/70 text-xs pointer-events-none font-mono">
            {formatDuration(element.duration)}
          </div>
        )}
        
        {/* Start time indicator for selected clips */}
        {isSelected && clipWidth > 80 && (
          <div className="absolute top-0 left-1 text-white/70 text-xs pointer-events-none font-mono">
            {formatDuration(element.startTime)}
          </div>
        )}
      </div>
    </>
  );
}