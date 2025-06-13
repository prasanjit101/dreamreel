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
  SkipForward
} from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { formatDuration } from '@/utils/mediaUtils';

export default function Timeline() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isFileLoaded,
    timelineElements,
    actions
  } = useVideoEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Don't render timeline if no media is loaded
  if (!isFileLoaded || timelineElements.length === 0) {
    return null;
  }

  const handlePlayheadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    actions.seek(newTime);
  };

  const handlePlayheadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

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

  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-64 bg-card border-t border-border">
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

      {/* Timeline Track */}
      <div className="flex-1 p-4">
        <div className="relative h-full">
          {/* Timeline ruler */}
          <div className="h-8 flex items-end border-b border-border mb-4">
            {duration > 0 && Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => (
              <div
                key={i}
                className="relative flex-1"
                style={{ minWidth: '40px' }}
              >
                <div className="absolute bottom-0 left-0 w-px h-3 bg-border"></div>
                <div className="absolute bottom-4 left-0 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDuration(i * 5)}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline scrubber */}
          <div
            ref={timelineRef}
            className="relative h-6 bg-muted/50 rounded cursor-pointer mb-4"
            onClick={handlePlayheadClick}
            onMouseMove={handlePlayheadDrag}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-primary/30 rounded"
              style={{ width: `${playheadPosition}%` }}
            />

            {/* Playhead */}
            <div
              className="absolute top-0 w-1 h-full bg-primary cursor-col-resize"
              style={{ left: `${playheadPosition}%` }}
            >
              <div className="w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            </div>
          </div>

          {/* Track lanes */}
          <div className="space-y-2">
            {/* Video track */}
            <div className="h-12 bg-muted/30 rounded border border-border flex items-center px-3 relative">
              <span className="text-muted-foreground text-xs font-medium">Video</span>

              {/* Render video elements */}
              {timelineElements
                .filter(el => el.type === 'video' || el.type === 'image')
                .map(element => (
                  <div
                    key={element.id}
                    className="absolute h-8 bg-blue-500/80 rounded border border-blue-400 flex items-center px-2"
                    style={{
                      left: `${(element.startTime / duration) * 100}%`,
                      width: `${(element.duration / duration) * 100}%`,
                      marginLeft: '60px'
                    }}
                  >
                    <span className="text-white text-xs truncate">
                      {element.mediaFile?.name || 'Media'}
                    </span>
                  </div>
                ))}
            </div>

            {/* Audio track */}
            <div className="h-12 bg-muted/30 rounded border border-border flex items-center px-3 relative">
              <span className="text-muted-foreground text-xs font-medium">Audio</span>

              {/* Render audio elements */}
              {timelineElements
                .filter(el => el.type === 'audio' || (el.type === 'video' && el.mediaFile))
                .map(element => (
                  <div
                    key={`${element.id}-audio`}
                    className="absolute h-8 bg-green-500/80 rounded border border-green-400 flex items-center px-2"
                    style={{
                      left: `${(element.startTime / duration) * 100}%`,
                      width: `${(element.duration / duration) * 100}%`,
                      marginLeft: '60px'
                    }}
                  >
                    <span className="text-white text-xs truncate">
                      {element.type === 'audio' ? element.mediaFile?.name : 'Video Audio'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}