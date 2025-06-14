"use client";

import React, { useRef, useState } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';

interface TimelineScrubberProps {
  duration: number;
  pixelsPerSecond: number;
}

export function TimelineScrubber({
  duration,
  pixelsPerSecond,
}: TimelineScrubberProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { currentTime, actions } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  const handlePlayheadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond));

    actions.seek(newTime);
  };

  const handlePlayheadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond));

    actions.seek(newTime);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const playheadPosition = duration > 0 ? (currentTime * pixelsPerSecond) : 0;

  return (
    <>
      {/* Playhead */}
      <div
        className="absolute top-0 w-0.5 h-full bg-red-500 z-20 pointer-events-none"
        style={{ left: `${playheadPosition}px` }}
      >
        <div className="w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
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
    </>
  );
}
