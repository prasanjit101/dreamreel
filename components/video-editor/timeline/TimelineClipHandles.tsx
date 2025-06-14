"use client";

import React from 'react';

interface TimelineClipHandlesProps {
  handleWidth: number;
  onMouseDownLeft: (e: React.MouseEvent) => void;
  onMouseDownRight: (e: React.MouseEvent) => void;
}

export const TimelineClipHandles: React.FC<TimelineClipHandlesProps> = ({
  handleWidth,
  onMouseDownLeft,
  onMouseDownRight,
}) => {
  return (
    <>
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bg-white/40 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
        style={{ 
          width: `${handleWidth}px`,
          height: '100%',
          borderRadius: '2px 0 0 2px'
        }}
        onMouseDown={onMouseDownLeft}
      >
        <div className="w-0.5 h-4 bg-white/80 rounded"></div>
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bg-white/40 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
        style={{ 
          width: `${handleWidth}px`,
          height: '100%',
          borderRadius: '0 2px 2px 0'
        }}
        onMouseDown={onMouseDownRight}
      >
        <div className="w-0.5 h-4 bg-white/80 rounded"></div>
      </div>
    </>
  );
};
