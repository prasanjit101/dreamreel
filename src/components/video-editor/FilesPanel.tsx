"use client";

import React from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { MediaUploader } from './MediaUploader';
import { Button } from "@/components/ui/button";
import { Trash2, Play } from 'lucide-react';
import { formatFileSize, formatDuration } from '@/utils/mediaUtils';

/**
 * FilesPanel Component
 * 
 * This component displays all imported media files and provides functionality
 * to manage them. It shows file information like name, size, duration, and
 * provides options to add files to timeline or delete them.
 * Now supports drag and drop to timeline tracks.
 */
export function FilesPanel() {
  const { mediaFiles, actions } = useVideoEditorStore();

  const handleAddToTimeline = (mediaFile: any) => {
    // Determine track based on media type
    let track = 0;
    if (mediaFile.type === 'audio') track = 1;
    else if (mediaFile.type === 'image') track = 3;
    else if (mediaFile.type === 'video') track = 0;
    
    // Create timeline element
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
  };

  const handleDeleteFile = (fileId: string) => {
    actions.removeMediaFile(fileId);
  };

  const handleDragStart = (event: React.DragEvent, mediaFile: any) => {
    // Set the data to be transferred during drag
    event.dataTransfer.setData('application/json', JSON.stringify({
      mediaFileId: mediaFile.id,
      mediaType: mediaFile.type
    }));
    event.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    event.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (event: React.DragEvent) => {
    // Remove visual feedback
    event.currentTarget.classList.remove('opacity-50');
  };

  return (
    <ScrollArea className="w-full h-full p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium text-sm">Project Files</h3>
          <MediaUploader variant="button" className="h-8 text-xs" />
        </div>
        
        {mediaFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">No media files imported yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, file)}
                onDragEnd={handleDragEnd}
                className="bg-muted/50 rounded-lg p-3 border border-border hover:bg-muted/70 transition-colors cursor-grab active:cursor-grabbing"
                title="Drag to timeline or click to add"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        file.type === 'video' ? 'bg-blue-500' :
                        file.type === 'audio' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <h4 className="text-foreground text-sm font-medium truncate">
                        {file.name}
                      </h4>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Size: {formatFileSize(file.file.size)}</span>
                        {file.duration && (
                          <span>Duration: {formatDuration(file.duration)}</span>
                        )}
                      </div>
                      <div className="capitalize">Type: {file.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddToTimeline(file)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Add to timeline"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}