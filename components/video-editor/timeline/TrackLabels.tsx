"use client";

import React from 'react';

export function TrackLabels() {
  return (
    <div className="w-20 bg-muted/50 border-r border-border flex flex-col">
      <div className="h-8 border-b border-border"></div>
      <div className="h-12 border-b border-border flex items-center px-3">
        <span className="text-muted-foreground text-xs font-medium">Video</span>
      </div>
      <div className="h-12 border-b border-border flex items-center px-3">
        <span className="text-muted-foreground text-xs font-medium">Audio</span>
      </div>
      <div className="h-12 border-b border-border flex items-center px-3">
        <span className="text-muted-foreground text-xs font-medium">Text</span>
      </div>
    </div>
  );
}
