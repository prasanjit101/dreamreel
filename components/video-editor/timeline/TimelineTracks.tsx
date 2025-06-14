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
}: TimelineTracksProps) {
  return (
    <div ref={tracksRef} className="relative">
      {allTrackNumbers.map(trackNumber => (
        <div key={trackNumber} className="h-12 bg-muted/20 border-b border-border relative">
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
        </div>
      ))}
    </div>
  );
}
