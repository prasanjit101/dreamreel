"use client";

import React from 'react';
import { TimelineElement } from '@/lib/store/video-editor-store';
import { Volume2, VolumeX } from 'lucide-react';
import { getClipIcon } from '@/utils/timelineUtils';

interface TimelineClipContentProps {
  element: TimelineElement;
}

export const TimelineClipContent: React.FC<TimelineClipContentProps> = ({ element }) => {
  return (
    <div className="flex items-center gap-1 text-white text-xs truncate flex-1 min-w-0 pointer-events-none">
      {React.createElement(getClipIcon(element.type), { className: "w-3 h-3" })}
      <span className="truncate font-medium">
        {element.mediaFile?.name || element.properties?.text || `${element.type} element`}
      </span>
      
      {/* Volume indicator for audio/video */}
      {(element.type === 'audio' || element.type === 'video') && (
        <div className="ml-auto flex items-center gap-1">
          {element.properties?.volume === 0 ? (
            <VolumeX className="w-3 h-3" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </div>
      )}
    </div>
  );
};
