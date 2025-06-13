"use client";

import React from 'react';
import { formatDuration } from '@/utils/mediaUtils';

interface TimelineRulerProps {
  duration: number;
  pixelsPerSecond: number;
  currentTime: number;
  playheadPosition: number;
  handlePlayheadClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePlayheadDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  timelineRef: React.RefObject<HTMLDivElement>;
}

export function TimelineRuler({
  duration,
  pixelsPerSecond,
  currentTime,
  playheadPosition,
  handlePlayheadClick,
  handlePlayheadDrag,
  handleMouseDown,
  handleMouseUp,
  timelineRef
}: TimelineRulerProps) {
  return (
    <div className="relative" style={{ width: `${duration * pixelsPerSecond}px` }}>
      {/* Time Ruler */}
      <div className="h-8 bg-muted border-b border-border relative">
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full flex items-end"
            style={{ left: `${i * pixelsPerSecond}px` }}
          >
            <div className="w-px h-4 bg-border"></div>
            <div className="absolute bottom-1 left-1 text-xs text-muted-foreground whitespace-nowrap">
              {formatDuration(i)}
            </div>
          </div>
        ))}
        
        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-20 pointer-events-none"
          style={{ left: `${playheadPosition}px` }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div
        ref={timelineRef}
        className="absolute top-0 left-0 w-full h-full cursor-pointer z-10"
        onClick={handlePlayheadClick}
        onMouseMove={handlePlayheadDrag}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
