"use client";

import React from 'react';
import { formatDuration } from '@/utils/mediaUtils';

interface TimelineRulerProps {
  duration: number;
  pixelsPerSecond: number;
}

export function TimelineRuler({
  duration,
  pixelsPerSecond,
}: TimelineRulerProps) {
  return (
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
    </div>
  );
}
