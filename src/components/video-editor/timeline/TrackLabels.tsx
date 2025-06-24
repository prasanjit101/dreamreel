"use client";

import React from 'react';

interface TrackLabelsProps {
  allTrackNumbers: number[];
  getTrackLabel: (trackNumber: number) => string;
}

export function TrackLabels({ allTrackNumbers, getTrackLabel }: TrackLabelsProps) {
  return (
    <div className="w-20 bg-muted/50 border-r border-border flex flex-col">
      <div className="h-8 border-b border-border"></div>
      {allTrackNumbers.map(trackNumber => (
        <div key={trackNumber} className="h-12 border-b border-border flex items-center px-3">
          <span className="text-muted-foreground text-xs font-medium">
            {getTrackLabel(trackNumber)}
          </span>
        </div>
      ))}
    </div>
  );
}
