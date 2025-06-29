"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { getClipIcon } from '@/utils/timelineUtils';

/**
 * TracksPanel Component
 * 
 * This component displays all timeline tracks and provides functionality
 * to manage them. It shows track information, visibility controls, and
 * allows adding new tracks or elements to existing tracks.
 */
export function TracksPanel() {
  const { timelineElements, actions } = useVideoEditorStore();

  // Group timeline elements by track
  const trackGroups = timelineElements.reduce((groups, element) => {
    const trackNumber = element.track;
    if (!groups[trackNumber]) {
      groups[trackNumber] = [];
    }
    groups[trackNumber].push(element);
    return groups;
  }, {} as Record<number, typeof timelineElements>);

  // Get all unique track numbers and sort them
  const trackNumbers = Object.keys(trackGroups).map(Number).sort((a, b) => a - b);

  // Helper function to get track label
  const getTrackLabel = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'Video Track';
      case 1: return 'Audio Track';
      case 2: return 'Text Track';
      case 3: return 'Image Track';
      case 4: return 'Subtitle Track';
      default: return `Track ${trackNumber + 1}`;
    }
  };

  // Helper function to get track color
  const getTrackColor = (trackNumber: number) => {
    switch (trackNumber) {
      case 0: return 'bg-blue-500/20 border-blue-500/30';
      case 1: return 'bg-green-500/20 border-green-500/30';
      case 2: return 'bg-orange-500/20 border-orange-500/30';
      case 3: return 'bg-purple-500/20 border-purple-500/30';
      case 4: return 'bg-yellow-500/20 border-yellow-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleSelectElement = (elementId: string) => {
    actions.setSelectedElement(elementId);
  };

  const handleDeleteElement = (elementId: string) => {
    actions.removeTimelineElement(elementId);
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium text-sm">Timeline Tracks</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled
            title="Add new track (coming soon)"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Track
          </Button>
        </div>
        
        {trackNumbers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No tracks created yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Import media files to automatically create tracks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trackNumbers.map((trackNumber) => {
              const elements = trackGroups[trackNumber];
              const trackLabel = getTrackLabel(trackNumber);
              const trackColor = getTrackColor(trackNumber);
              
              return (
                <div
                  key={trackNumber}
                  className={`rounded-lg border p-3 ${trackColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        trackNumber === 0 ? 'bg-blue-500' :
                        trackNumber === 1 ? 'bg-green-500' :
                        trackNumber === 2 ? 'bg-orange-500' :
                        trackNumber === 3 ? 'bg-purple-500' :
                        trackNumber === 4 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <h4 className="text-foreground text-sm font-medium">
                        {trackLabel}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        ({elements.length} element{elements.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        title="Toggle visibility (coming soon)"
                        disabled
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {(trackNumber === 0 || trackNumber === 1) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          title="Toggle mute (coming soon)"
                          disabled
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {elements.length > 0 && (
                    <div className="space-y-2">
                      {elements.map((element) => {
                        const IconComponent = getClipIcon(element.type);
                        return (
                          <div
                            key={element.id}
                            className="bg-background/50 rounded p-2 border border-border/50 hover:bg-background/70 transition-colors cursor-pointer"
                            onClick={() => handleSelectElement(element.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <IconComponent className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-foreground truncate">
                                  {element.mediaFile?.name || element.properties?.text || `${element.type} element`}
                                  {element.type === 'subtitle' && element.properties?.subtitleEntries && (
                                    <span className="ml-2 text-muted-foreground">
                                      ({element.properties.subtitleEntries.length} entries)
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{element.startTime.toFixed(1)}s</span>
                                <span>-</span>
                                <span>{(element.startTime + element.duration).toFixed(1)}s</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}