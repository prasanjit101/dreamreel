"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TimelineElement } from '@/lib/store/video-editor-store.types';


interface TextConfigFormProps {
  onConfigChange: (config: { text: string; fontSize: number; fontFamily: string; color: string }) => void;
  initialConfig?: Partial<TimelineElement['properties']>;
}

export function TextConfigForm({ onConfigChange, initialConfig }: TextConfigFormProps) {
  const [textContent, setTextContent] = useState(initialConfig?.text ?? 'New Text');
  const [fontSize, setFontSize] = useState(initialConfig?.fontSize ?? 24);
  const [fontFamily, setFontFamily] = useState(initialConfig?.fontFamily ?? 'Arial');
  const [color, setColor] = useState(initialConfig?.color ?? '#ffffff');

  useEffect(() => {
    onConfigChange({ text: textContent, fontSize, fontFamily, color });
  }, [textContent, fontSize, fontFamily, color, onConfigChange]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
  };

  const handleFontSizeChange = (values: number[]) => {
    setFontSize(values[0]);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Text Content</Label>
        <Textarea id="text-content" placeholder="Enter your text here" value={textContent} onChange={handleTextChange} />
      </div>
      <div>
        <Label htmlFor="text-font">Font</Label>
        <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
          <SelectTrigger id="text-font" className="w-[180px]">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="text-size">Font Size</Label>
        <Slider 
          value={[fontSize]} 
          max={72} 
          min={8} 
          step={1} 
          className="w-[60%]" 
          onValueChange={handleFontSizeChange} 
        />
      </div>
      <div>
        <Label htmlFor="text-color">Color</Label>
        <Input id="text-color" type="color" value={color} onChange={handleColorChange} className="w-24 h-8 p-0" />
      </div>
      {/* Add more text specific settings like animation, position */}
    </div>
  );
}
