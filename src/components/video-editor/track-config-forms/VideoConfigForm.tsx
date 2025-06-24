"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimelineElement } from '@/lib/store/video-editor-store';

interface VideoConfigFormProps {
  onConfigChange: (config: { resolution: string; playbackSpeed: number; file?: File }) => void;
  initialConfig?: Partial<TimelineElement['properties']>;
}

export function VideoConfigForm({ onConfigChange, initialConfig }: VideoConfigFormProps) {
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [resolution, setResolution] = useState(initialConfig?.resolution ?? '1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState(initialConfig?.playbackSpeed ?? 1);

  useEffect(() => {
    onConfigChange({ resolution, playbackSpeed, file: videoFile });
  }, [resolution, playbackSpeed, videoFile, onConfigChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideoFile(event.target.files[0]);
    } else {
      setVideoFile(undefined);
    }
  };

  const handleResolutionChange = (value: string) => {
    setResolution(value);
  };

  const handlePlaybackSpeedChange = (values: number[]) => {
    setPlaybackSpeed(values[0]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video-file">Video File</Label>
        <Input id="video-file" type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      <div>
        <Label htmlFor="video-resolution">Resolution</Label>
        <Select value={resolution} onValueChange={handleResolutionChange}>
          <SelectTrigger id="video-resolution" className="w-[180px]">
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="480p">854x480 (480p)</SelectItem>
            <SelectItem value="720p">1280x720 (720p)</SelectItem>
            <SelectItem value="1080p">1920x1080 (1080p)</SelectItem>
            <SelectItem value="1440p">2560x1440 (1440p)</SelectItem>
            <SelectItem value="2160p">3840x2160 (4K)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="video-speed">Playback Speed</Label>
        <Slider 
          value={[playbackSpeed]} 
          max={2} 
          min={0.1} 
          step={0.1} 
          className="w-[60%]" 
          onValueChange={handlePlaybackSpeedChange} 
        />
      </div>
      {/* Add more video specific settings */}
    </div>
  );
}
