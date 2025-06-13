"use client";

import React, { useState } from 'react';
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
  Copy
} from 'lucide-react';
import { useVideoEditorStore, VideoEditorState, TimelineElement } from '@/lib/store/video-editor-store';
import { formatDuration } from '@/utils/mediaUtils';

interface TimelineControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  selectedElementId: string | null;
  timelineElements: TimelineElement[];
  actions: VideoEditorState['actions'];
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export function TimelineControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  selectedElementId,
  timelineElements,
  actions,
  zoom,
  setZoom
}: TimelineControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

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

  return (
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
  );
}
