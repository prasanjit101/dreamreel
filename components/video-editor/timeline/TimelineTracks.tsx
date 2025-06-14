"use client";

import React from 'react';
import { TimelineClip } from '../TimelineClip'; // Relative import for TimelineClip
import { TimelineElement, VideoEditorState } from '@/lib/store/video-editor-store'; // Import TimelineElement and VideoEditorState

interface TimelineTracksProps {
  videoElements: TimelineElement[];
  audioElements: TimelineElement[];
  textElements: TimelineElement[];
  duration: number;
  trackHeight: number;
  pixelsPerSecond: number;
  selectedElementId: string | null;
  actions: VideoEditorState['actions'];
  tracksRef: React.RefObject<HTMLDivElement>;
}

export function TimelineTracks({
  videoElements,
  audioElements,
  textElements,
  duration,
  trackHeight,
  pixelsPerSecond,
  selectedElementId,
  actions,
  tracksRef
}: TimelineTracksProps) {
  // Combine all elements for the allElements prop
  const allElements = [...videoElements, ...audioElements, ...textElements];
  // Set a default zoom value (adjust as needed)
  const zoom = 1;

  return (
    <div ref={tracksRef} className="relative">
      {/* Video Track */}
      <div className="h-12 bg-muted/20 border-b border-border relative">
        {videoElements.map(element => (
          <TimelineClip
            key={element.id}
            element={element}
            duration={duration}
            trackHeight={trackHeight}
            pixelsPerSecond={pixelsPerSecond}
            trackIndex={0}
            onSelect={actions.setSelectedElement}
            isSelected={selectedElementId === element.id}
            allElements={allElements}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Audio Track */}
      <div className="h-12 bg-muted/20 border-b border-border relative">
        {audioElements.map(element => (
          <TimelineClip
            key={`${element.id}-audio`}
            element={element}
            duration={duration}
            trackHeight={trackHeight}
            pixelsPerSecond={pixelsPerSecond}
            trackIndex={1}
            onSelect={actions.setSelectedElement}
            isSelected={selectedElementId === element.id}
            allElements={allElements}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Text Track */}
      <div className="h-12 bg-muted/20 border-b border-border relative">
        {textElements.map(element => (
          <TimelineClip
            key={element.id}
            element={element}
            duration={duration}
            trackHeight={trackHeight}
            pixelsPerSecond={pixelsPerSecond}
            trackIndex={2}
            onSelect={actions.setSelectedElement}
            isSelected={selectedElementId === element.id}
            allElements={allElements}
            zoom={zoom}
          />
        ))}
      </div>
    </div>
  );
}
