"use client";

import React from 'react';
import { TimelineElement, MediaFile } from '@/lib/store/video-editor-store.types';
import { TimelineDropIndicatorProps } from './timeline.types';

export const TimelineDropIndicator: React.FC<TimelineDropIndicatorProps> = ({
  dropZone,
  pixelsPerSecond,
  trackLabel,
  draggedItem
}) => {
  if (!dropZone || !draggedItem) return null;

  const position = dropZone.position * pixelsPerSecond;
  const duration = ('duration' in draggedItem ? draggedItem.duration : draggedItem.duration) ?? 5;
  const width = duration * pixelsPerSecond;
  const name = 'name' in draggedItem ? draggedItem.name : (draggedItem.mediaFile?.name || 'Element');

  const getInsertionMessage = () => {
    switch (dropZone.insertionType) {
      case 'before':
        return `Insert before existing item (${dropZone.position.toFixed(1)}s)`;
      case 'after':
        return `Insert after existing item (${dropZone.position.toFixed(1)}s)`;
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
            className={`absolute top-1 h-10 border-2 rounded pointer-events-none z-15 flex items-center px-2 transition-all duration-200 ${dropZone.insertionType === 'before' || dropZone.insertionType === 'after'
              ? 'bg-blue-500/30 border-blue-500/50 animate-pulse'
              : 'bg-green-500/30 border-green-500/50'
              }`}
            style={{ 
              left: `${position}px`, 
              width: `${Math.max(width, 60)}px` 
            }}
          >
            <span className={`text-xs font-medium truncate ${dropZone.insertionType === 'before' || dropZone.insertionType === 'after'
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-green-700 dark:text-green-300'
              }`}>
              {name}
            </span>

            {/* Insertion direction indicator */}
            {dropZone.insertionType === 'before' && (
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-4 border-b-4 border-r-6 border-transparent border-r-blue-500"></div>
              </div>
            )}
            {dropZone.insertionType === 'after' && (
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-blue-500"></div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};