"use client";

import React, { useState, useRef } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineControls } from './timeline/TimelineControls';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimelineScrubber } from './timeline/TimelineScrubber';
import { TrackLabels } from './timeline/TrackLabels';
import { TimelineTracks } from './timeline/TimelineTracks';
import { getTrackLabel } from '@/utils/timelineUtils';

/**
 * Professional Timeline Component
 *
 * This component provides a professional-grade timeline interface with:
 * - Dynamic track management
 * - Infinite horizontal scrolling
 * - Snap-to-grid and snap-to-elements
 * - Robust drag and resize operations
 * - Multi-track support with automatic expansion
 */
export default function Timeline() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isFileLoaded,
    timelineElements,
    selectedElementId,
    maxTracks,
    snapToGrid,
    snapToElements,
    actions
  } = useVideoEditorStore();

  const [zoom, setZoom] = useState(1);
  const tracksRef = useRef<HTMLDivElement>(null);

  if (!isFileLoaded || timelineElements.length === 0) {
    return null;
  }

  // Calculate pixels per second based on zoom level
  const pixelsPerSecond = 50 * zoom;

  // Calculate dynamic timeline width with generous buffer for infinite scrolling
  const minTimelineWidth = 1200; // Minimum width
  const contentWidth = duration * pixelsPerSecond;
  const bufferWidth = 500; // Extra space for adding new content
  const timelineWidth = Math.max(minTimelineWidth, contentWidth + bufferWidth);

  // Fixed track height
  const trackHeight = 48;

  // Group timeline elements by track
  const trackGroups = timelineElements.reduce((groups, element) => {
    const trackNumber = element.track;
    if (!groups[trackNumber]) {
      groups[trackNumber] = [];
    }
    groups[trackNumber].push(element);
    return groups;
  }, {} as Record<number, typeof timelineElements>);

  // Generate all track numbers (ensure we have enough tracks)
  const usedTracks = Object.keys(trackGroups).map(Number);
  const highestUsedTrack = usedTracks.length > 0 ? Math.max(...usedTracks) : -1;
  const totalTracks = Math.max(maxTracks, highestUsedTrack + 3); // Always have extra tracks available
  const allTrackNumbers = Array.from({ length: totalTracks }, (_, i) => i);

  return (
    <div className="h-80 bg-card border-t border-border flex flex-col">
      {/* Timeline Controls Section - Fixed */}
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
        snapToGrid={snapToGrid}
        snapToElements={snapToElements}
      />

      {/* Main Timeline Area */}
      <div className="flex-1 flex">
        {/* Track Labels Section - Fixed */}
        <TrackLabels
          allTrackNumbers={allTrackNumbers}
          getTrackLabel={getTrackLabel}
        />

        {/* Scrollable Timeline Content Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {/* Timeline content container with dynamic width */}
          <div 
            className="relative bg-muted/10" 
            style={{ width: `${timelineWidth}px`, minHeight: '100%' }}
          >
            {/* Timeline Ruler - Fixed at top */}
            <TimelineRuler
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
              timelineWidth={timelineWidth}
            />
            
            {/* Timeline Scrubber - Playhead indicator */}
            <TimelineScrubber
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
              timelineWidth={timelineWidth}
            />
            
            {/* Timeline Tracks - Scrollable content */}
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
              timelineWidth={timelineWidth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}