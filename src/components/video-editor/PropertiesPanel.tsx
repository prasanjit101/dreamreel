"use client";

import React, { useState } from 'react';
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { formatDuration, formatFileSize } from '@/utils/mediaUtils';
import { Trash2, Copy, Volume2, Type, Palette, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubtitleEditorModal } from './SubtitleEditorModal';

export function PropertiesPanel({ className }: { className?: string }) {
  const { timelineElements, selectedElementId, actions } = useVideoEditorStore();
  const [subtitleEditModal, setSubtitleEditModal] = useState<{
    open: boolean;
    element: any;
  }>({ open: false, element: null });
  
  const selectedElement = timelineElements.find(el => el.id === selectedElementId);

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElementId) return;
    
    if (property === 'startTime' || property === 'duration') {
      actions.updateTimelineElement(selectedElementId, { [property]: value });
    } else {
      actions.updateTimelineElement(selectedElementId, {
        properties: {
          ...selectedElement?.properties,
          [property]: value
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedElementId) {
      actions.removeTimelineElement(selectedElementId);
    }
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: selectedElement.startTime + selectedElement.duration
      };
      actions.addTimelineElement(newElement);
    }
  };

  const handleEditSubtitles = () => {
    if (selectedElement && selectedElement.type === 'subtitle') {
      setSubtitleEditModal({ open: true, element: selectedElement });
    }
  };

  if (!selectedElement) {
    return (
      <ScrollArea className="w-full bg-card border-t border-border p-4 h-full">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-foreground font-medium">No item selected</h3>
            <p className="text-muted-foreground text-sm">
              Select a timeline element to edit its properties
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <>
      <ScrollArea className={cn("w-full bg-card border-t border-border h-full", className)}>
        <div className="space-y-4  p-4">
          {/* Header with element info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedElement.type === 'video' && <div className="w-3 h-3 bg-blue-500 rounded"></div>}
              {selectedElement.type === 'audio' && <div className="w-3 h-3 bg-green-500 rounded"></div>}
              {selectedElement.type === 'image' && <div className="w-3 h-3 bg-purple-500 rounded"></div>}
              {selectedElement.type === 'text' && <div className="w-3 h-3 bg-orange-500 rounded"></div>}
              {selectedElement.type === 'subtitle' && <div className="w-3 h-3 bg-yellow-500 rounded"></div>}
              <h3 className="text-foreground font-medium text-sm capitalize">
                {selectedElement.type} Properties
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Basic Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-xs">Start Time</Label>
              <Input
                id="startTime"
                type="number"
                step="0.1"
                min="0"
                value={selectedElement.startTime.toFixed(1)}
                onChange={(e) => handlePropertyChange('startTime', parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs">Duration</Label>
              <Input
                id="duration"
                type="number"
                step="0.1"
                min="0.1"
                value={selectedElement.duration.toFixed(1)}
                onChange={(e) => handlePropertyChange('duration', parseFloat(e.target.value) || 0.1)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Media File Info */}
          {selectedElement.mediaFile && (
            <div className="space-y-2">
              <Label className="text-xs">Media File</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Name: {selectedElement.mediaFile.name}</div>
                <div>Size: {formatFileSize(selectedElement.mediaFile.file.size)}</div>
                {selectedElement.mediaFile.duration && (
                  <div>Original Duration: {formatDuration(selectedElement.mediaFile.duration)}</div>
                )}
              </div>
            </div>
          )}

          {/* Volume Control for Audio/Video */}
          {(selectedElement.type === 'audio' || selectedElement.type === 'video') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <Label className="text-xs">Volume</Label>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[(selectedElement.properties?.volume || 1) * 100]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(values) => handlePropertyChange('volume', values[0] / 100)}
                />
                <span className="text-xs text-muted-foreground min-w-[35px]">
                  {Math.round((selectedElement.properties?.volume || 1) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Text Properties */}
          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <Label htmlFor="text" className="text-xs">Text Content</Label>
                </div>
                <Textarea
                  id="text"
                  value={selectedElement.properties?.text || ''}
                  onChange={(e) => handlePropertyChange('text', e.target.value)}
                  placeholder="Enter text content..."
                  className="h-16 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min="12"
                    max="200"
                    value={selectedElement.properties?.fontSize || 48}
                    onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 48)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <Label htmlFor="color" className="text-xs">Color</Label>
                  </div>
                  <Input
                    id="color"
                    type="color"
                    value={selectedElement.properties?.color || '#ffffff'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subtitle Properties */}
          {selectedElement.type === 'subtitle' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Subtitle Information</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  {selectedElement.properties?.subtitleEntries && (
                    <div>Entries: {selectedElement.properties.subtitleEntries.length}</div>
                  )}
                  <div>Duration: {formatDuration(selectedElement.duration)}</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleEditSubtitles}
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Subtitles
              </Button>

              {/* Subtitle Style Preview */}
              {selectedElement.properties?.subtitleStyle && (
                <div className="space-y-2">
                  <Label className="text-xs">Style Settings</Label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Font: {selectedElement.properties.subtitleStyle.fontFamily} ({selectedElement.properties.subtitleStyle.fontSize}px)</div>
                    <div>Position: {selectedElement.properties.subtitleStyle.position}</div>
                    <div>Alignment: {selectedElement.properties.subtitleStyle.alignment}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Position Properties for Text/Image */}
          {(selectedElement.type === 'text' || selectedElement.type === 'image') && (
            <div className="space-y-4">
              {/* Position Controls */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Position</Label>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="x-slider" className="text-xs">X Position</Label>
                      <span className="text-xs text-muted-foreground min-w-[40px]">
                        {selectedElement.properties?.x || 0}px
                      </span>
                    </div>
                    <Slider
                      id="x-slider"
                      value={[selectedElement.properties?.x || 0]}
                      min={-500}
                      max={500}
                      step={1}
                      className="w-full"
                      onValueChange={(values) => handlePropertyChange('x', values[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="y-slider" className="text-xs">Y Position</Label>
                      <span className="text-xs text-muted-foreground min-w-[40px]">
                        {selectedElement.properties?.y || 0}px
                      </span>
                    </div>
                    <Slider
                      id="y-slider"
                      value={[selectedElement.properties?.y || 0]}
                      min={-500}
                      max={500}
                      step={1}
                      className="w-full"
                      onValueChange={(values) => handlePropertyChange('y', values[0])}
                    />
                  </div>
                </div>
              </div>

              {/* Size Controls */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Size</Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scale-slider" className="text-xs">Scale</Label>
                    <span className="text-xs text-muted-foreground min-w-[40px]">
                      {Math.round((selectedElement.properties?.scale || 1) * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="scale-slider"
                    value={[(selectedElement.properties?.scale || 1) * 100]}
                    min={10}
                    max={300}
                    step={5}
                    className="w-full"
                    onValueChange={(values) => handlePropertyChange('scale', values[0] / 100)}
                  />
                </div>
              </div>

              {/* Opacity Control */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Opacity</Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="opacity-slider" className="text-xs">Opacity</Label>
                    <span className="text-xs text-muted-foreground min-w-[40px]">
                      {Math.round((selectedElement.properties?.opacity || 1) * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="opacity-slider"
                    value={[(selectedElement.properties?.opacity || 1) * 100]}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    onValueChange={(values) => handlePropertyChange('opacity', values[0] / 100)}
                  />
                </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-3">
                <Label className="text-xs font-medium">Rotation</Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rotation-slider" className="text-xs">Rotation</Label>
                    <span className="text-xs text-muted-foreground min-w-[40px]">
                      {selectedElement.properties?.rotation || 0}°
                    </span>
                  </div>
                  <Slider
                    id="rotation-slider"
                    value={[selectedElement.properties?.rotation || 0]}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                    onValueChange={(values) => handlePropertyChange('rotation', values[0])}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Subtitle Editor Modal */}
      <SubtitleEditorModal
        open={subtitleEditModal.open}
        onOpenChange={(open) => setSubtitleEditModal({ open, element: null })}
        mediaFile={subtitleEditModal.element?.mediaFile || null}
      />
    </>
  );
}