"use client";

import React from 'react';
import { TimelineClip } from '../TimelineClip';
import { TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store';

interface TimelineTracksProps {
  allTrackNumbers: number[];
  trackGroups: Record<number, TimelineElement[]>;
  timelineElements: TimelineElement[];
  duration: number;
  trackHeight: number;
  pixelsPerSecond: number;
  selectedElementId: string | null;
  actions: VideoEditorState['actions'];
  tracksRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  timelineWidth: number;
}

export function TimelineTracks({
  allTrackNumbers,
  trackGroups,
  timelineElements,
  duration,
  trackHeight,
  pixelsPerSecond,
  selectedElementId,
  actions,
  tracksRef,
  zoom,
  timelineWidth,
}: TimelineTracksProps) {
  const handleTrackClick = (e: React.MouseEvent, trackNumber: number) => {
    // Only handle clicks on empty track areas
    if (e.target === e.currentTarget) {
      // Deselect any selected element when clicking on empty track
      actions.setSelectedElement(null);
    }
  };

  const handleTrackDrop = (e: React.DragEvent, trackNumber: number) => {
    e.preventDefault();
    // Handle drop events for future drag-and-drop from media panel
    console.log('Drop on track:', trackNumber);
  };

  const handleTrackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div ref={tracksRef} className="relative z-20">
      {allTrackNumbers.map(trackNumber => (
        <div 
          key={trackNumber} 
          className="relative border-b border-border hover:bg-muted/10 transition-colors"
          style={{ height: `${trackHeight}px`, width: `${timelineWidth}px` }}
          onClick={(e) => handleTrackClick(e, trackNumber)}
          onDrop={(e) => handleTrackDrop(e, trackNumber)}
          onDragOver={handleTrackDragOver}
        >
          {/* Track background with subtle grid */}
          <div className="absolute inset-0 bg-muted/5">
            {/* Vertical grid lines every 10 seconds */}
            {Array.from({ length: Math.ceil(duration / 10) }, (_, i) => (
              <div
                key={`grid-${trackNumber}-${i}`}
                className="absolute top-0 h-full w-px bg-border/10"
                style={{ left: `${(i + 1) * 10 * pixelsPerSecond}px` }}
              />
            ))}
          </div>

          {/* Track elements */}
          {(trackGroups[trackNumber] || []).map(element => (
            <TimelineClip
              key={element.id}
              element={element}
              duration={duration}
              trackHeight={trackHeight}
              pixelsPerSecond={pixelsPerSecond}
              trackIndex={trackNumber}
              onSelect={actions.setSelectedElement}
              isSelected={selectedElementId === element.id}
              allElements={timelineElements}
              zoom={zoom}
            />
          ))}

          {/* Track number indicator for empty tracks */}
          {(!trackGroups[trackNumber] || trackGroups[trackNumber].length === 0) && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 text-xs pointer-events-none">
              Drop media here
            </div>
          )}
        </div>
      ))}
    </div>
  );
}