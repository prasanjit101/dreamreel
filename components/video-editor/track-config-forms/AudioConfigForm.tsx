"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface AudioConfigFormProps {
  onConfigChange: (config: { volume: number; file?: File }) => void;
  initialConfig?: { volume?: number };
}

export function AudioConfigForm({ onConfigChange, initialConfig }: AudioConfigFormProps) {
  const [volume, setVolume] = useState(initialConfig?.volume ?? 75);
  const [audioFile, setAudioFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    onConfigChange({ volume, file: audioFile });
  }, [volume, audioFile, onConfigChange]);

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAudioFile(event.target.files[0]);
    } else {
      setAudioFile(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="audio-file">Audio File</Label>
        <Input id="audio-file" type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
      <div>
        <Label htmlFor="audio-volume">Volume</Label>
        <Slider 
          value={[volume]} 
          max={100} 
          step={1} 
          className="w-[60%]" 
          onValueChange={handleVolumeChange} 
        />
      </div>
      {/* Add more audio specific settings like fade in/out */}
    </div>
  );
}
