"use client";

import React, { useRef } from 'react';
import { TimelineElement } from '@/lib/store/video-editor-store.types';
import { formatDuration } from '@/utils/mediaUtils';
import { cn } from '@/lib/utils';
import { getClipColor } from '@/utils/timelineUtils';
import { useTimelineClipInteractions } from './timeline/hooks/use-timeline-clip-interactions';
import { TimelineClipSnapIndicator } from './timeline/TimelineClipSnapIndicator';
import { TimelineClipContent } from './timeline/TimelineClipContent';
import { TimelineClipHandles } from './timeline/TimelineClipHandles';

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
  isDraggedElement?: boolean;
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
  zoom,
  isDraggedElement = false
}: TimelineClipProps) {
  const clipRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    isResizing,
    snapIndicator,
    handleMouseDown,
    handleDoubleClick,
    handleMouseDownLeftResize,
    handleMouseDownRightResize,
  } = useTimelineClipInteractions({
    element,
    duration,
    pixelsPerSecond,
    allElements,
    onSelect,
    clipRef,
  });

  const clipWidth = Math.max(element.duration * pixelsPerSecond, 20);
  const clipLeft = element.startTime * pixelsPerSecond;
  const handleWidth = Math.max(8, 12 / zoom);

  // Handle drag start for existing timeline elements
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      timelineElementId: element.id,
      elementType: element.type
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-primary text-primary-foreground px-3 py-2 rounded shadow-lg';
    dragImage.textContent = element.mediaFile?.name || element.properties?.text || `${element.type} element`;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <>
      <TimelineClipSnapIndicator position={snapIndicator.position} visible={snapIndicator.visible} />
      
      <div
        ref={clipRef}
        draggable={!isDragging && !isResizing}
        onDragStart={handleDragStart}
        className={cn(
          'absolute rounded border-2 flex items-center px-2 cursor-move select-none',
          isDragging || isResizing ? 'transition-none' : 'transition-all duration-300 ease-out',
          getClipColor(element.type),
          isSelected && 'ring-2 ring-white ring-opacity-50 shadow-lg',
          isDragging && 'opacity-80 scale-105 z-30 shadow-xl',
          isResizing && 'opacity-80 z-30 shadow-xl',
          isDraggedElement && 'opacity-50 scale-95',
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
        title={`${element.mediaFile?.name || element.properties?.text || element.type} - Double-click to split, drag to move`}
      >
        <TimelineClipHandles 
          handleWidth={handleWidth} 
          onMouseDownLeft={handleMouseDownLeftResize} 
          onMouseDownRight={handleMouseDownRightResize} 
        />

        <TimelineClipContent element={element} />

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

        {/* Drag indicator for existing elements */}
        {!isDraggedElement && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute top-1 right-1 w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="absolute top-1 right-4 w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="absolute top-1 right-7 w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        )}
      </div>
    </>
  );
}