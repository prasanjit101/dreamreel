"use client";

import React from 'react';
import { MediaFile, TimelineElement } from '@/lib/store/video-editor-store.types';
import { getClipIcon, getClipColor } from '@/utils/timelineUtils';
import { formatDuration } from '@/utils/mediaUtils';
import { DragPreviewProps } from './timeline.types';



export const DragPreview: React.FC<DragPreviewProps> = ({
  mediaFile,
  element,
  x,
  y,
  width,
  visible,
  isValidDrop,
  dragType
}) => {
  if (!visible) return null;

  // Determine the item to display
  const displayItem = element || mediaFile;
  if (!displayItem) return null;

  const itemType = element?.type || mediaFile?.type;
  const itemName = element?.mediaFile?.name || element?.properties?.text || mediaFile?.name || 'Unknown';
  const itemDuration = element?.duration || mediaFile?.duration;

  if (!itemType) return null;

  const IconComponent = getClipIcon(itemType);
  const clipColor = getClipColor(itemType);

  return (
    <div
      className={`fixed pointer-events-none z-50 transition-opacity duration-150 ${
        visible ? 'opacity-90' : 'opacity-0'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${Math.max(120, width)}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`
          rounded border-2 flex items-center px-3 py-2 shadow-lg backdrop-blur-sm
          ${clipColor}
          ${isValidDrop 
            ? 'border-white/50 shadow-green-500/20' 
            : 'border-red-500/50 shadow-red-500/20 opacity-60'
          }
          ${dragType === 'existing' ? 'ring-2 ring-blue-400/50' : ''}
        `}
        style={{ height: '40px' }}
      >
        <div className="flex items-center gap-2 text-white text-sm truncate flex-1 min-w-0">
          <IconComponent className="w-4 h-4 flex-shrink-0" />
          <span className="truncate font-medium">
            {itemName}
          </span>
          {itemDuration && (
            <span className="text-white/70 text-xs ml-auto flex-shrink-0">
              {formatDuration(itemDuration)}
            </span>
          )}
        </div>
        
        {/* Drag type indicator */}
        {dragType === 'existing' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white/50" />
        )}
      </div>
      
      {/* Drop indicator */}
      <div className={`
        absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0
        border-l-4 border-r-4 border-t-4 border-transparent
        ${isValidDrop ? 'border-t-green-500' : 'border-t-red-500'}
      `} />
    </div>
  );
};