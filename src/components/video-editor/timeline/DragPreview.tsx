"use client";

import React from 'react';
import { MediaFile } from '@/lib/store/video-editor-store.types';
import { getClipIcon, getClipColor } from '@/utils/timelineUtils';
import { formatDuration } from '@/utils/mediaUtils';

interface DragPreviewProps {
  mediaFile: MediaFile;
  x: number;
  y: number;
  width: number;
  visible: boolean;
  isValidDrop: boolean;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  mediaFile,
  x,
  y,
  width,
  visible,
  isValidDrop
}) => {
  if (!visible) return null;

  const IconComponent = getClipIcon(mediaFile.type);
  const clipColor = getClipColor(mediaFile.type);

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
        `}
        style={{ height: '40px' }}
      >
        <div className="flex items-center gap-2 text-white text-sm truncate flex-1 min-w-0">
          <IconComponent className="w-4 h-4 flex-shrink-0" />
          <span className="truncate font-medium">
            {mediaFile.name}
          </span>
          {mediaFile.duration && (
            <span className="text-white/70 text-xs ml-auto flex-shrink-0">
              {formatDuration(mediaFile.duration)}
            </span>
          )}
        </div>
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