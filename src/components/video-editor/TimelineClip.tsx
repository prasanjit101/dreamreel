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
  const handleWidth = Math.max(8, 12 / zoom); // Adjust handle size based on zoom

  return (
    <>
      <TimelineClipSnapIndicator position={snapIndicator.position} visible={snapIndicator.visible} />
      
      <div
        ref={clipRef}
        className={cn(
          'absolute rounded border-2 flex items-center px-2 cursor-move select-none transition-all duration-75',
          getClipColor(element.type),
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
      </div>
    </>
  );
}
