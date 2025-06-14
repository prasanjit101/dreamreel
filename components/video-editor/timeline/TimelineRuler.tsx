"use client";

import React from 'react';
import { formatDuration } from '@/utils/mediaUtils';

interface TimelineRulerProps {
  duration: number;
  pixelsPerSecond: number;
  timelineWidth: number;
}

export function TimelineRuler({
  duration,
  pixelsPerSecond,
  timelineWidth,
}: TimelineRulerProps) {
  // Calculate the interval between major markers based on zoom level
  const getMarkerInterval = () => {
    if (pixelsPerSecond > 100) return 0.5; // Every 0.5 seconds at high zoom
    if (pixelsPerSecond > 50) return 1;    // Every 1 second at medium zoom
    if (pixelsPerSecond > 25) return 2;    // Every 2 seconds at low zoom
    return 5; // Every 5 seconds at very low zoom
  };

  const markerInterval = getMarkerInterval();
  const totalMarkers = Math.ceil(timelineWidth / pixelsPerSecond / markerInterval);

  return (
    <div className="h-8 bg-muted border-b border-border relative">
      {/* Major time markers */}
      {Array.from({ length: totalMarkers + 1 }, (_, i) => {
        const time = i * markerInterval;
        const position = time * pixelsPerSecond;
        
        return (
          <div
            key={i}
            className="absolute top-0 h-full flex items-end"
            style={{ left: `${position}px` }}
          >
            <div className="w-px h-4 bg-border"></div>
            <div className="absolute bottom-1 left-1 text-xs text-muted-foreground whitespace-nowrap">
              {formatDuration(time)}
            </div>
          </div>
        );
      })}

      {/* Minor markers (half intervals) for better precision */}
      {pixelsPerSecond > 50 && Array.from({ length: totalMarkers * 2 }, (_, i) => {
        const time = (i + 0.5) * markerInterval;
        const position = time * pixelsPerSecond;
        
        if (position > timelineWidth) return null;
        
        return (
          <div
            key={`minor-${i}`}
            className="absolute top-0 h-full flex items-end"
            style={{ left: `${position}px` }}
          >
            <div className="w-px h-2 bg-border/50"></div>
          </div>
        );
      })}

      {/* Grid lines for better visual alignment */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: Math.ceil(timelineWidth / 10) }, (_, i) => (
          <div
            key={`grid-${i}`}
            className="absolute top-0 h-full w-px bg-border/20"
            style={{ left: `${i * 10}px` }}
          />
        ))}
      </div>
    </div>
  );
}