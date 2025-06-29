"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Volume2 } from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { createMediaFileFromBlob } from '@/utils/mediaUtils';
import { toast } from 'sonner';

interface ElevenLabsTTSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ElevenLabsTTSModal({ open, onOpenChange }: ElevenLabsTTSModalProps) {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { actions } = useVideoEditorStore();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert to speech');
      return;
    }

    if (text.length > 5000) {
      toast.error('Text is too long. Maximum 5000 characters allowed.');
      return;
    }

    if (!filename.trim()) {
      toast.error('Please enter a filename for the generated audio');
      return;
    }

    setIsGenerating(true);

    try {
      // Call our API route to generate audio
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Get the audio blob from the response
      const audioBlob = await response.blob();

      // Ensure filename has .mp3 extension
      const finalFilename = filename.trim().endsWith('.mp3') 
        ? filename.trim() 
        : `${filename.trim()}.mp3`;

      // Create a MediaFile from the blob
      const mediaFile = await createMediaFileFromBlob(
        audioBlob,
        finalFilename,
        'audio/mpeg'
      );

      // Add the generated audio to the media files
      actions.addMediaFile(mediaFile);

      // Show success message
      toast.success(`Audio "${finalFilename}" generated successfully!`);

      // Reset form and close modal
      setText('');
      setFilename('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setText('');
      setFilename('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Generate Audio with Eleven Labs
          </DialogTitle>
          <DialogDescription>
            Convert text to speech using AI-powered voice synthesis. The generated audio will be added to your project files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              placeholder="Enter filename (e.g., narration, intro)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              The .mp3 extension will be added automatically if not provided.
            </p>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text">Text to Speech</Label>
            <Textarea
              id="text"
              placeholder="Enter the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isGenerating}
              className="min-h-[120px] resize-none"
              maxLength={5000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maximum 5000 characters</span>
              <span>{text.length}/5000</span>
            </div>
          </div>

          {/* Generation Status */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating audio... This may take a few moments.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || !filename.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Audio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}