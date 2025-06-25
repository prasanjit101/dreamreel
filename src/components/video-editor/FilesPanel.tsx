"use client";

import React from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { MediaUploader } from './MediaUploader';
import { Button } from "@/components/ui/button";
import { Trash2, Play, GripVertical, Plus } from 'lucide-react';
import { formatFileSize, formatDuration } from '@/utils/mediaUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * FilesPanel Component
 * 
 * This component displays all imported media files and provides functionality
 * to manage them. It shows file information like name, size, duration, and
 * provides options to add files to timeline or delete them.
 * Now supports professional drag and drop to timeline tracks.
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
    console.log('Starting drag for media file:', mediaFile);
    
    // Set the data to be transferred during drag
    const dragData = {
      mediaFileId: mediaFile.id,
      mediaType: mediaFile.type,
      source: 'filesPanel'
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
    
    console.log('Drag data set:', dragData);
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-primary text-primary-foreground px-3 py-2 rounded shadow-lg';
    dragImage.textContent = mediaFile.name;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
  };

  const handleDragEnd = (event: React.DragEvent) => {
    // Remove any visual feedback
    event.currentTarget.classList.remove('opacity-50');
    console.log('Drag ended for media file');
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium text-sm">Project Files</h3>
        <div className="flex items-center gap-2">
          <MediaUploader variant="button" className="h-8 text-xs" />
          <Button variant="outline" size="icon" className="h-8 text-xs">
            {/* this button will open a modal where the user can generate video, audio, image or text */}
            <Plus className="w-3 h-3" />
          </Button>
        </div>
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
                className="bg-muted/50 rounded-lg p-3 border border-border hover:bg-muted/70 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md group"
                title="Drag to timeline or click to add"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Drag handle */}
                    <div className="flex items-center justify-center w-5 h-5 mt-1 opacity-0 group-hover:opacity-60 transition-opacity">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          file.type === 'video' ? 'bg-blue-500' :
                          file.type === 'audio' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`} />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h4 className="text-foreground text-xs font-medium max-w-[95px] truncate">
                                {file.name}
                              </h4>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="max-w-xs break-words">
                              {file.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddToTimeline(file)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to timeline"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}