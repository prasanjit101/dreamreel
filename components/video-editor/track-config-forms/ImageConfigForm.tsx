"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TimelineElement } from '@/lib/store/video-editor-store';

interface ImageConfigFormProps {
  onConfigChange: (config: { displayDuration: number; file?: File }) => void;
  initialConfig?: Partial<TimelineElement['properties']>;
}

export function ImageConfigForm({ onConfigChange, initialConfig }: ImageConfigFormProps) {
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [displayDuration, setDisplayDuration] = useState(initialConfig?.displayDuration ?? 5);

  useEffect(() => {
    onConfigChange({ displayDuration, file: imageFile });
  }, [displayDuration, imageFile, onConfigChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(undefined);
    }
  };

  const handleDurationChange = (values: number[]) => {
    setDisplayDuration(values[0]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-file">Image File</Label>
        <Input id="image-file" type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div>
        <Label htmlFor="image-duration">Display Duration (seconds)</Label>
        <Slider 
          value={[displayDuration]} 
          max={30} 
          min={1} 
          step={0.5} 
          className="w-[60%]" 
          onValueChange={handleDurationChange} 
        />
      </div>
      {/* Add more image specific settings like transition effects */}
    </div>
  );
}
