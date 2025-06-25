"use client";

import React from 'react';
import { TimelineElement, MediaFile } from '@/lib/store/video-editor-store.types';

interface DropZone {
  trackNumber: number;
  position: number;
  insertionType: 'before' | 'after' | 'exact';
  targetElementId?: string;
  isValid: boolean;
}

interface TimelineDropIndicatorProps {
  dropZone: DropZone;
  pixelsPerSecond: number;
  trackLabel: string;
  draggedItem: MediaFile | TimelineElement | null;
}

export const TimelineDropIndicator: React.FC<TimelineDropIndicatorProps> = ({
  dropZone,
  pixelsPerSecond,
  trackLabel,
  draggedItem
}) => {
  if (!dropZone || !draggedItem) return null;

  const position = dropZone.position * pixelsPerSecond;
  const duration = 'duration' in draggedItem ? draggedItem.duration : (draggedItem.duration || 5);
  const width = duration * pixelsPerSecond;
  const name = 'name' in draggedItem ? draggedItem.name : (draggedItem.mediaFile?.name || 'Element');

  const getInsertionMessage = () => {
    switch (dropZone.insertionType) {
      case 'before':
        return `Insert before existing item`;
      case 'after':
        return `Insert after existing item`;
      case 'exact':
        return `Place at ${dropZone.position.toFixed(1)}s`;
      default:
        return `Drop to add to ${trackLabel}`;
    }
  };

  return (
    <>
      {/* Track overlay with message */}
      <div className={`absolute inset-0 border-2 border-dashed pointer-events-none z-10 ${
        dropZone.isValid ? 'border-green-500/50' : 'border-red-500/50'
      }`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm ${
            dropZone.isValid 
              ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
              : 'bg-red-500/20 text-red-700 dark:text-red-300'
          }`}>
            {dropZone.isValid 
              ? getInsertionMessage()
              : `Cannot drop ${draggedItem.type || 'item'} here`
            }
          </span>
        </div>
      </div>
      
      {/* Position indicator with preview */}
      {dropZone.isValid && (
        <>
          {/* Drop position line */}
          <div
            className="absolute top-0 w-0.5 h-full bg-green-500 z-20 pointer-events-none"
            style={{ left: `${position}px` }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          
          {/* Preview of where the item will be placed */}
          <div
            className="absolute top-1 h-10 bg-green-500/30 border-2 border-green-500/50 rounded pointer-events-none z-15 flex items-center px-2"
            style={{ 
              left: `${position}px`, 
              width: `${Math.max(width, 60)}px` 
            }}
          >
            <span className="text-xs text-green-700 dark:text-green-300 font-medium truncate">
              {name}
            </span>
            {dropZone.insertionType !== 'exact' && (
              <div className={`absolute ${
                dropZone.insertionType === 'before' ? '-left-2' : '-right-2'
              } top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500`} />
            )}
          </div>
        </>
      )}
    </>
  );
};