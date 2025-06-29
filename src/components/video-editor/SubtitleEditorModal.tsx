"use client";

import React, { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Subtitles, Download } from 'lucide-react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { SubtitleEntry, MediaFile } from '@/lib/store/video-editor-store.types';
import { formatSrtTimecode, exportToSrt } from '@/utils/mediaUtils';
import { toast } from 'sonner';

interface SubtitleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaFile: MediaFile | null;
}

export function SubtitleEditorModal({ open, onOpenChange, mediaFile }: SubtitleEditorModalProps) {
  const [subtitleEntries, setSubtitleEntries] = useState<SubtitleEntry[]>([]);
  const [subtitleStyle, setSubtitleStyle] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom' as 'bottom' | 'top' | 'center',
    alignment: 'center' as 'left' | 'center' | 'right'
  });
  const { actions, timelineElements } = useVideoEditorStore();

  // Initialize subtitle entries when modal opens
  useEffect(() => {
    if (open && mediaFile?.subtitleEntries) {
      setSubtitleEntries([...mediaFile.subtitleEntries]);
    }
  }, [open, mediaFile]);

  const handleAddEntry = () => {
    const newEntry: SubtitleEntry = {
      id: `subtitle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      start: subtitleEntries.length > 0 ? Math.max(...subtitleEntries.map(e => e.end)) : 0,
      end: subtitleEntries.length > 0 ? Math.max(...subtitleEntries.map(e => e.end)) + 3 : 3,
      text: 'New subtitle'
    };
    setSubtitleEntries([...subtitleEntries, newEntry]);
  };

  const handleUpdateEntry = (id: string, updates: Partial<SubtitleEntry>) => {
    setSubtitleEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  };

  const handleDeleteEntry = (id: string) => {
    setSubtitleEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const handleSave = () => {
    if (!mediaFile) return;

    // Sort entries by start time
    const sortedEntries = [...subtitleEntries].sort((a, b) => a.start - b.start);

    // Validate entries
    const invalidEntries = sortedEntries.filter(entry => 
      entry.start >= entry.end || entry.text.trim() === ''
    );

    if (invalidEntries.length > 0) {
      toast.error('Please fix invalid subtitle entries (start time must be before end time, and text cannot be empty)');
      return;
    }

    // Update the media file
    const updatedMediaFile = {
      ...mediaFile,
      subtitleEntries: sortedEntries,
      duration: sortedEntries.length > 0 ? Math.max(...sortedEntries.map(e => e.end)) : 0
    };

    // Update in store
    actions.removeMediaFile(mediaFile.id);
    actions.addMediaFile(updatedMediaFile);

    // Update any timeline elements that use this media file
    const relatedTimelineElements = timelineElements.filter(
      element => element.mediaFile?.id === mediaFile.id
    );

    relatedTimelineElements.forEach(element => {
      actions.updateTimelineElement(element.id, {
        properties: {
          ...element.properties,
          subtitleEntries: sortedEntries,
          subtitleStyle
        },
        duration: updatedMediaFile.duration
      });
    });

    toast.success('Subtitles updated successfully');
    onOpenChange(false);
  };

  const handleExportSrt = () => {
    if (subtitleEntries.length === 0) {
      toast.error('No subtitle entries to export');
      return;
    }

    const srtContent = exportToSrt(subtitleEntries);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mediaFile?.name.replace('.srt', '') || 'subtitles'}_edited.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('SRT file exported successfully');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  const parseTime = (timeString: string): number => {
    const [mins, secs] = timeString.split(':').map(Number);
    return (mins || 0) * 60 + (secs || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Subtitles className="w-5 h-5" />
            Edit Subtitles - {mediaFile?.name}
          </DialogTitle>
          <DialogDescription>
            Edit subtitle entries and styling. Changes will be applied to all timeline instances.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Subtitle Entries */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Subtitle Entries ({subtitleEntries.length})</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSrt}
                  disabled={subtitleEntries.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export SRT
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              {subtitleEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Subtitles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No subtitle entries yet</p>
                  <p className="text-sm">Click "Add Entry" to create your first subtitle</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subtitleEntries
                    .sort((a, b) => a.start - b.start)
                    .map((entry, index) => (
                    <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Entry #{index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`start-${entry.id}`} className="text-xs">
                            Start Time (MM:SS.S)
                          </Label>
                          <Input
                            id={`start-${entry.id}`}
                            value={formatTime(entry.start)}
                            onChange={(e) => {
                              const newStart = parseTime(e.target.value);
                              if (!isNaN(newStart)) {
                                handleUpdateEntry(entry.id, { start: newStart });
                              }
                            }}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${entry.id}`} className="text-xs">
                            End Time (MM:SS.S)
                          </Label>
                          <Input
                            id={`end-${entry.id}`}
                            value={formatTime(entry.end)}
                            onChange={(e) => {
                              const newEnd = parseTime(e.target.value);
                              if (!isNaN(newEnd)) {
                                handleUpdateEntry(entry.id, { end: newEnd });
                              }
                            }}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`text-${entry.id}`} className="text-xs">
                          Subtitle Text
                        </Label>
                        <Textarea
                          id={`text-${entry.id}`}
                          value={entry.text}
                          onChange={(e) => handleUpdateEntry(entry.id, { text: e.target.value })}
                          className="text-xs resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Duration: {formatTime(entry.end - entry.start)} | 
                        SRT: {formatSrtTimecode(entry.start)} → {formatSrtTimecode(entry.end)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* Subtitle Styling */}
          <div className="w-80 space-y-4">
            <h3 className="text-sm font-medium">Subtitle Styling</h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="12"
                  max="72"
                  value={subtitleStyle.fontSize}
                  onChange={(e) => setSubtitleStyle(prev => ({
                    ...prev,
                    fontSize: parseInt(e.target.value) || 24
                  }))}
                  className="text-xs"
                />
              </div>

              <div>
                <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
                <Select
                  value={subtitleStyle.fontFamily}
                  onValueChange={(value) => setSubtitleStyle(prev => ({
                    ...prev,
                    fontFamily: value
                  }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color" className="text-xs">Text Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={subtitleStyle.color}
                  onChange={(e) => setSubtitleStyle(prev => ({
                    ...prev,
                    color: e.target.value
                  }))}
                  className="h-8"
                />
              </div>

              <div>
                <Label htmlFor="position" className="text-xs">Position</Label>
                <Select
                  value={subtitleStyle.position}
                  onValueChange={(value: 'bottom' | 'top' | 'center') => setSubtitleStyle(prev => ({
                    ...prev,
                    position: value
                  }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alignment" className="text-xs">Alignment</Label>
                <Select
                  value={subtitleStyle.alignment}
                  onValueChange={(value: 'left' | 'center' | 'right') => setSubtitleStyle(prev => ({
                    ...prev,
                    alignment: value
                  }))}
                >
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

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-black text-center">
                <div className="text-xs text-muted-foreground mb-2">Preview</div>
                <div
                  style={{
                    fontSize: `${subtitleStyle.fontSize}px`,
                    fontFamily: subtitleStyle.fontFamily,
                    color: subtitleStyle.color,
                    textAlign: subtitleStyle.alignment,
                    backgroundColor: subtitleStyle.backgroundColor,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}
                >
                  Sample subtitle text
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}