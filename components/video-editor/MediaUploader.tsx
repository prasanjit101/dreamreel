"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { createMediaFile, isValidMediaFile } from '@/utils/mediaUtils';
import { toast } from 'sonner';

interface MediaUploaderProps {
  variant?: 'button' | 'dropzone';
  className?: string;
}

export function MediaUploader({ variant = 'dropzone', className }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { actions } = useVideoEditorStore();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!isValidMediaFile(file)) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      try {
        const mediaFile = await createMediaFile(file);
        actions.addMediaFile(mediaFile);
        
        // Determine track based on media type
        let track = 0;
        if (mediaFile.type === 'audio') track = 1;
        else if (mediaFile.type === 'image') track = 3; // Image track
        else if (mediaFile.type === 'video') track = 0; // Video track
        
        // Auto-add to timeline
        const timelineElement = {
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: mediaFile.type,
          startTime: 0,
          duration: mediaFile.duration || 5,
          track,
          mediaFile,
          properties: {
            volume: mediaFile.type === 'audio' || mediaFile.type === 'video' ? 1 : undefined
          }
        };
        
        actions.addTimelineElement(timelineElement);
        
        // Set the composition duration to match the media duration
        if (mediaFile.duration) {
          actions.setDuration(mediaFile.duration);
        }
        
        toast.success(`Added ${mediaFile.name} to ${track === 0 ? 'video' : track === 1 ? 'audio' : track === 3 ? 'image' : 'text'} track`);
      } catch (error) {
        console.error('Error loading media file:', error);
        toast.error(`Failed to load ${file.name}`);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Reset the input so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (variant === 'button') {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="video/*,audio/*,image/*"
          multiple
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          className={className}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import Media
        </Button>
      </>
    );
  }

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="video/*,audio/*,image/*"
        multiple
      />
      <Button
        variant="ghost"
        size="icon"
        className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
        onClick={handleButtonClick}
      >
        <Plus className="w-8 h-8" />
      </Button>
      <div className="space-y-2">
        <h3 className="text-foreground font-medium">Click to upload media files</h3>
        <p className="text-muted-foreground text-sm">
          Supports video, audio, and image files
        </p>
      </div>
    </div>
  );
}