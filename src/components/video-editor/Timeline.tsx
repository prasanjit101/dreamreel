"use client";

import React, { useState, useRef } from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineControls } from './timeline/TimelineControls';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimelineScrubber } from './timeline/TimelineScrubber';
import { TrackLabels } from './timeline/TrackLabels';
import { TimelineTracks } from './timeline/TimelineTracks';

/**
 * Timeline Component
 *
 * This component serves as the main container for the video editing timeline.
 * It orchestrates the various sub-components like controls, ruler, scrubber,
 * track labels, and the tracks themselves. It manages the global state related
 * to the timeline, such as playback status, current time, zoom level, and
 * timeline elements.
 */
export default function Timeline() {
  // Destructure state and actions from the video editor store
  const {
    isPlaying,          // Whether the video is currently playing
    currentTime,        // Current playback time in seconds
    duration,           // Total duration of the video in seconds
    volume,             // Current volume level (0-1)
    isFileLoaded,       // Whether a video file has been loaded
    timelineElements,   // Array of all elements (clips, audio, text, images, subtitles) on the timeline
    selectedElementId,  // ID of the currently selected timeline element
    actions             // Actions to modify the video editor state
  } = useVideoEditorStore();

  const [zoom, setZoom] = useState(1); // 1 means 100% zoom

  // Ref for the tracks container, used for potential future interactions or measurements
  const tracksRef = useRef<HTMLDivElement>(null);

  if (!isFileLoaded || timelineElements.length === 0) {
    return null;
  }

  // --- Derived State and Calculations ---
  // Calculate pixels per second based on the current zoom level
  const pixelsPerSecond = 50 * zoom;

  // Calculate the total width of the timeline, ensuring a minimum width
  const timelineWidth = Math.max(duration * pixelsPerSecond, 800); // Minimum 800px width

  // Define the fixed height for each track
  const trackHeight = 48;

  // Group timeline elements by their assigned track number
  // This creates an object where keys are track numbers and values are arrays of elements on that track.
  const trackGroups = timelineElements.reduce((groups, element) => {
    const trackNumber = element.track;
    if (!groups[trackNumber]) {
      groups[trackNumber] = []; // Initialize array for new track
    }
    groups[trackNumber].push(element); // Add element to its respective track
    return groups;
  }, {} as Record<number, typeof timelineElements>);

  // Get all unique track numbers present in the timeline elements and sort them numerically
  const trackNumbers = Object.keys(trackGroups).map(Number).sort((a, b) => a - b);

  // Determine the total number of tracks to display.
  // Ensures at least 5 tracks (Video, Audio, Text, Image, Subtitle) are visible,
  // or more if elements exist on higher-numbered tracks.
  const minTracks = Math.max(5, trackNumbers.length);
  const allTrackNumbers = Array.from({ length: minTracks }, (_, i) => i);

  // Helper function to provide a human-readable label for each track number
  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text';
      case 3: return 'Image';
      case 4: return 'Subtitle';
      default: return `Track ${trackNumber + 1}`; // For additional custom tracks
    }
  };

  // --- Render Logic ---
  return (
    <div className="h-80 bg-card border-t border-border flex flex-col">
      {/* Timeline Controls Section */}
      {/* Contains playback controls, time display, zoom controls, and volume controls. */}
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

      {/* Main Timeline Area */}
      <div className="flex-1 flex">
        {/* Track Labels Section */}
        {/* Displays labels for each track (e.g., Video, Audio, Text, Subtitle). */}
        <TrackLabels
          allTrackNumbers={allTrackNumbers}
          getTrackLabel={getTrackLabel}
        />

        {/* Scrollable Timeline Content Area */}
        <div className="flex-1 overflow-x-auto">
          {/* Container for the timeline ruler, scrubber, and tracks, with dynamic width */}
          <div className="relative" style={{ width: `${timelineWidth}px` }}>
            {/* Timeline Ruler Section */}
            {/* Displays time markers along the top of the timeline. */}
            <TimelineRuler
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
            />
            {/* Timeline Scrubber Section */}
            {/* Represents the current playback position and handles scrubbing interactions. */}
            <TimelineScrubber
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
            />
            {/* Timeline Tracks Section */}
            {/* Renders all individual tracks and the media clips within them. */}
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