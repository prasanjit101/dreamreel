"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Plus,
  Scissors
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AudioConfigForm } from '@/components/video-editor/track-config-forms/AudioConfigForm';
import { VideoConfigForm } from '@/components/video-editor/track-config-forms/VideoConfigForm';
import { ImageConfigForm } from '@/components/video-editor/track-config-forms/ImageConfigForm';
import { TextConfigForm } from '@/components/video-editor/track-config-forms/TextConfigForm';
import { VideoEditorState, TimelineElement, MediaFile } from '@/lib/store/video-editor-store.types';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrackType, setSelectedTrackType] = useState<'audio' | 'video' | 'image' | 'text' | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>({});
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);

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
          id: `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          startTime: element.startTime + element.duration
        };
        actions.addTimelineElement(newElement);
      }
    }
  };

  const handleConfigChange = (config: any) => {
    setCurrentConfig(config);
    if (config.file) {
      setCurrentFile(config.file);
    } else {
      setCurrentFile(undefined);
    }
  };

  const handleAddTrack = async () => {
    if (!selectedTrackType) return;

    let mediaFile: MediaFile | undefined = undefined;
    if (currentFile) {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(currentFile);
      mediaFile = {
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: currentFile.name,
        type: selectedTrackType === 'audio' ? 'audio' : selectedTrackType === 'video' ? 'video' : 'image',
        url: fileUrl,
        file: currentFile,
        duration: 1, // Will be updated once media is loaded
      };
      actions.addMediaFile(mediaFile);
    }

    const newElement: TimelineElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: selectedTrackType,
      startTime: 0, // Default start time
      duration: currentConfig.displayDuration || 5, // Default duration for images/text, will be updated for media
      track: -1, // Will be assigned by store
      mediaFile: mediaFile,
      properties: { ...currentConfig },
    };

    actions.addTimelineElement(newElement);
    setDialogOpen(false);
  };

  return (
    <div className="h-16 bg-muted border-b border-border flex items-center justify-between px-4">
      {/* Left side - Playback controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isPlaying ? actions.pause() : actions.play()}
            className="text-foreground hover:text-foreground p-2 bg-primary/10 hover:bg-primary/20"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>

        {/* Time display */}
        <div className="flex items-center gap-1 ml-4">
          <span className="text-foreground text-sm font-mono">
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
          className="text-muted-foreground hover:text-foreground p-2"
          onClick={() => {
            console.log('The video will be split at the current playhead position');
          }}
        >
          <Scissors className="w-4 h-4 rotate-90" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedTrackType} Track</DialogTitle>
            <DialogDescription>
              Configure your {selectedTrackType} track settings
            </DialogDescription>
          </DialogHeader>
          {selectedTrackType === 'audio' && <AudioConfigForm onConfigChange={handleConfigChange} initialConfig={currentConfig} />}
          {selectedTrackType === 'video' && <VideoConfigForm onConfigChange={handleConfigChange} initialConfig={currentConfig} />}
          {selectedTrackType === 'image' && <ImageConfigForm onConfigChange={handleConfigChange} initialConfig={currentConfig} />}
          {selectedTrackType === 'text' && <TextConfigForm onConfigChange={handleConfigChange} initialConfig={currentConfig} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTrack}>Add Track</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
