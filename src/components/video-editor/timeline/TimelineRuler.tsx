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
  // Minimum pixel distance between markers
  const MIN_MARKER_PIXEL_DIST = 60;

  // Calculate the interval (in seconds) between markers
  let interval = 1;
  while (interval * pixelsPerSecond < MIN_MARKER_PIXEL_DIST) {
    if (interval < 10) interval *= 2;
    else if (interval < 60) interval = 10 * Math.ceil(interval / 10);
    else interval *= 2;
  }

  // Number of markers to render
  const markerCount = Math.ceil(duration / interval) + 1;

  return (
    <div className="h-8 bg-muted border-b border-border relative select-none">
      {Array.from({ length: markerCount }, (_, idx) => {
        const time = idx * interval;
        const left = time * pixelsPerSecond;
        if (time > duration) return null;
        return (
          <div
            key={time}
            className="absolute top-0 h-full flex items-end"
            style={{ left: `${left}px` }}
          >
            <div className="w-px h-4 bg-border"></div>
            <div className="absolute bottom-1 left-1 text-xs text-muted-foreground whitespace-nowrap">
              {formatDuration(time)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
