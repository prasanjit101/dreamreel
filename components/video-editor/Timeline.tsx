"use client";

import React, { useState, useRef } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineControls } from './timeline/TimelineControls';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimelineScrubber } from './timeline/TimelineScrubber';
import { TrackLabels } from './timeline/TrackLabels';
import { TimelineTracks } from './timeline/TimelineTracks';

export default function Timeline() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isFileLoaded,
    timelineElements,
    selectedElementId,
    actions
  } = useVideoEditorStore();

  const [zoom, setZoom] = useState(1);
  const tracksRef = useRef<HTMLDivElement>(null);

  // Don't render timeline if no media is loaded
  if (!isFileLoaded || timelineElements.length === 0) {
    return null;
  }

  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = Math.max(duration * pixelsPerSecond, 800);
  const trackHeight = 48;

  // Group elements by track dynamically
  const trackGroups = timelineElements.reduce((groups, element) => {
    const trackNumber = element.track;
    if (!groups[trackNumber]) {
      groups[trackNumber] = [];
    }
    groups[trackNumber].push(element);
    return groups;
  }, {} as Record<number, typeof timelineElements>);

  // Get all track numbers and sort them
  const trackNumbers = Object.keys(trackGroups).map(Number).sort((a, b) => a - b);

  // Ensure we have at least 4 tracks for video, audio, text, and image
  const minTracks = Math.max(4, trackNumbers.length);
  const allTrackNumbers = Array.from({ length: minTracks }, (_, i) => i);

  // Track type mapping for labels
  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text';
      case 3: return 'Image';
      default: return `Track ${trackNumber + 1}`;
    }
  };


  return (
    <div className="h-80 bg-card border-t border-border flex flex-col">
      <TimelineControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        selectedElementId={selectedElementId}
        timelineElements={timelineElements}
        actions={actions}
        zoom={zoom}
        setZoom={setZoom}
      />

      <div className="flex-1 flex">
        <TrackLabels
          allTrackNumbers={allTrackNumbers}
          getTrackLabel={getTrackLabel}
        />

        <div className="flex-1 overflow-x-auto">
          <div className="relative" style={{ width: `${timelineWidth}px` }}>
            <TimelineRuler
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
            />
            <TimelineScrubber
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
            />
            <TimelineTracks
              allTrackNumbers={allTrackNumbers}
              trackGroups={trackGroups}
              timelineElements={timelineElements}
              duration={duration}
              trackHeight={trackHeight}
              pixelsPerSecond={pixelsPerSecond}
              selectedElementId={selectedElementId}
              actions={actions}
              tracksRef={tracksRef}
              zoom={zoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
