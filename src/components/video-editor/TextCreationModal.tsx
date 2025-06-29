"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Type, Palette } from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineElement } from '@/lib/store/video-editor-store.types';
import { toast } from 'sonner';

interface TextCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TextCreationModal({ open, onOpenChange }: TextCreationModalProps) {
  const [textContent, setTextContent] = useState('Enter your text here');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0)');
  const [duration, setDuration] = useState(5);
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  
  const { actions } = useVideoEditorStore();

  const handleCreate = () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text content');
      return;
    }

    // Create a new text timeline element
    const textElement: TimelineElement = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      startTime: 0, // Will be positioned at the beginning by default
      duration: duration,
      track: 2, // Text track
      properties: {
        text: textContent.trim(),
        fontSize,
        fontFamily,
        color,
        backgroundColor,
        position,
        alignment,
        x: 0, // Center position
        y: 0, // Center position
        scale: 1,
        opacity: 1,
        rotation: 0
      }
    };

    // Add to timeline
    actions.addTimelineElement(textElement);
    
    // Select the new element
    actions.setSelectedElement(textElement.id);
    
    toast.success(`Text element "${textContent.substring(0, 20)}${textContent.length > 20 ? '...' : ''}" created successfully!`);
    
    // Reset form and close modal
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setTextContent('Enter your text here');
    setFontSize(48);
    setFontFamily('Arial');
    setColor('#ffffff');
    setBackgroundColor('rgba(0, 0, 0, 0)');
    setDuration(5);
    setPosition('center');
    setAlignment('center');
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Create Text Element
          </DialogTitle>
          <DialogDescription>
            Create a new text overlay for your video. You can adjust the styling and positioning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              placeholder="Enter your text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This text will appear as an overlay on your video</span>
              <span>{textContent.length}/500</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[duration]}
                min={1}
                max={30}
                step={0.5}
                className="flex-1"
                onValueChange={(values) => setDuration(values[0])}
              />
              <span className="text-sm text-muted-foreground min-w-[60px]">
                {duration}s
              </span>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Typography</Label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Font Family */}
              <div className="space-y-2">
                <Label htmlFor="font-family" className="text-xs">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Impact">Impact</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-xs">Font Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={120}
                    step={2}
                    className="flex-1"
                    onValueChange={(values) => setFontSize(values[0])}
                  />
                  <span className="text-xs text-muted-foreground min-w-[35px]">
                    {fontSize}px
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Text Color */}
              <div className="space-y-2">
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-8 p-1 rounded"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="bg-color" className="text-xs">Background</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor.startsWith('rgba') ? '#000000' : backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-8 p-1 rounded"
                  />
                  <Select 
                    value={backgroundColor.startsWith('rgba') ? 'transparent' : 'solid'}
                    onValueChange={(value) => {
                      if (value === 'transparent') {
                        setBackgroundColor('rgba(0, 0, 0, 0)');
                      } else {
                        setBackgroundColor('#000000');
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Position and Alignment */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Position & Alignment</Label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-xs">Vertical Position</Label>
                <Select value={position} onValueChange={(value: 'center' | 'top' | 'bottom') => setPosition(value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alignment */}
              <div className="space-y-2">
                <Label htmlFor="alignment" className="text-xs">Text Alignment</Label>
                <Select value={alignment} onValueChange={(value: 'left' | 'center' | 'right') => setAlignment(value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="border rounded-lg p-4 bg-black min-h-[100px] flex items-center justify-center">
              <div
                style={{
                  fontSize: `${Math.min(fontSize, 24)}px`, // Scale down for preview
                  fontFamily,
                  color,
                  backgroundColor: backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : backgroundColor,
                  textAlign: alignment,
                  padding: backgroundColor !== 'rgba(0, 0, 0, 0)' ? '8px 12px' : '0',
                  borderRadius: backgroundColor !== 'rgba(0, 0, 0, 0)' ? '4px' : '0',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {textContent || 'Enter your text here'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Preview shows scaled-down version. Actual size will be {fontSize}px in the video.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!textContent.trim()}>
            Create Text Element
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}