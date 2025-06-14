"use client";

import React from 'react';

interface TimelineClipSnapIndicatorProps {
  position: number;
  visible: boolean;
}

export const TimelineClipSnapIndicator: React.FC<TimelineClipSnapIndicatorProps> = ({ position, visible }) => {
  if (!visible) return null;

  return (
    <div
      className="absolute top-0 w-0.5 h-full bg-yellow-400 z-30 pointer-events-none"
      style={{ left: `${position}px` }}
    />
  );
};
