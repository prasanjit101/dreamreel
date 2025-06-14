"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Plus
} from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { formatDuration } from '@/utils/mediaUtils';
import { TimelineClip } from './TimelineClip';

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

  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);
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

  // Ensure we have at least 3 tracks for video, audio, and text
  const minTracks = Math.max(3, trackNumbers.length);
  const allTrackNumbers = Array.from({ length: minTracks }, (_, i) => i);

  // Track type mapping for labels
  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text';
      default: return `Track ${trackNumber + 1}`;
    }
  };

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

  const handleVolumeToggle = () => {
    if (isMuted) {
      actions.setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      actions.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100;
    actions.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSkipBack = () => {
    actions.seek(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    actions.seek(Math.min(duration, currentTime + 10));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.2));
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      actions.removeTimelineElement(selectedElementId);
    }
  };

  const handleCopySelected = () => {
    if (selectedElementId) {
      const element = timelineElements.find(el => el.id === selectedElementId);
      if (element) {
        const newElement = {
          ...element,
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startTime: element.startTime + element.duration
        };
        actions.addTimelineElement(newElement);
      }
    }
  };

  const handleAddTrack = () => {
    // Add a new empty track by incrementing the highest track number
    const maxTrack = Math.max(...trackNumbers, 2);
    // Track will be created when an element is added to it
  };

  const playheadPosition = duration > 0 ? (currentTime * pixelsPerSecond) : 0;

  return (
    <div className="h-80 bg-card border-t border-border flex flex-col">
      {/* Timeline Controls */}
      <div className="h-16 bg-muted border-b border-border flex items-center justify-between px-4">
        {/* Left side - Playback controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipBack}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => isPlaying ? actions.pause() : actions.play()}
              className="text-foreground hover:text-foreground p-2 bg-primary/10 hover:bg-primary/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipForward}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-foreground text-sm font-mono min-w-[60px]">
              {formatDuration(currentTime)}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground text-sm font-mono min-w-[60px]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Center - Timeline tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-muted-foreground text-xs min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTrack}
            className="text-muted-foreground hover:text-foreground p-2"
            title="Add Track"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {selectedElementId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySelected}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSelected}
                className="text-muted-foreground hover:text-red-500 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Right side - Volume controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVolumeToggle}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider 
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={handleVolumeChange}
          />
          <span className="text-muted-foreground text-xs min-w-[35px]">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex">
        {/* Track Labels */}
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

        {/* Timeline Content */}
        <div className="flex-1 overflow-x-auto">
          <div className="relative" style={{ width: `${timelineWidth}px` }}>
            {/* Time Ruler */}
            <div className="h-8 bg-muted border-b border-border relative">
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-end"
                  style={{ left: `${i * pixelsPerSecond}px` }}
                >
                  <div className="w-px h-4 bg-border"></div>
                  <div className="absolute bottom-1 left-1 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDuration(i)}
                  </div>
                </div>
              ))}
              
              {/* Playhead */}
              <div
                className="absolute top-0 w-0.5 h-full bg-red-500 z-20 pointer-events-none"
                style={{ left: `${playheadPosition}px` }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
              </div>
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

            {/* Dynamic Tracks */}
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
          </div>
        </div>
      </div>
    </div>
  );
}