"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useVideoEditorStore, TimelineElement } from '@/lib/store/video-editor-store';
import { formatDuration } from '@/utils/mediaUtils';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Type, Image, Video, Music } from 'lucide-react';

interface TimelineClipProps {
  element: TimelineElement;
  duration: number;
  trackHeight: number;
  pixelsPerSecond: number;
  trackIndex: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function TimelineClip({
  element,
  duration,
  trackHeight,
  pixelsPerSecond,
  trackIndex,
  onSelect,
  isSelected
}: TimelineClipProps) {
  const { actions } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, startTime: 0, duration: 0 });
  const clipRef = useRef<HTMLDivElement>(null);

  const clipWidth = element.duration * pixelsPerSecond;
  const clipLeft = element.startTime * pixelsPerSecond;

  // Get clip color based on type
  const getClipColor = () => {
    switch (element.type) {
      case 'video':
        return 'bg-blue-500/80 border-blue-400';
      case 'audio':
        return 'bg-green-500/80 border-green-400';
      case 'image':
        return 'bg-purple-500/80 border-purple-400';
      case 'text':
        return 'bg-orange-500/80 border-orange-400';
      default:
        return 'bg-gray-500/80 border-gray-400';
    }
  };

  // Get icon for clip type
  const getClipIcon = () => {
    switch (element.type) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'audio':
        return <Music className="w-3 h-3" />;
      case 'image':
        return <Image className="w-3 h-3" />;
      case 'text':
        return <Type className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(element.id);
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const handleWidth = 8;

    // Check if clicking on resize handles
    if (relativeX <= handleWidth) {
      setIsResizing('left');
      setResizeStart({
        x: e.clientX,
        startTime: element.startTime,
        duration: element.duration
      });
    } else if (relativeX >= rect.width - handleWidth) {
      setIsResizing('right');
      setResizeStart({
        x: e.clientX,
        startTime: element.startTime,
        duration: element.duration
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        startTime: element.startTime
      });
    }
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaTime = deltaX / pixelsPerSecond;
        const newStartTime = Math.max(0, Math.min(
          duration - element.duration,
          dragStart.startTime + deltaTime
        ));

        actions.updateTimelineElement(element.id, {
          startTime: newStartTime
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaTime = deltaX / pixelsPerSecond;

        if (isResizing === 'left') {
          // Resize from left (trim start)
          const newStartTime = Math.max(0, resizeStart.startTime + deltaTime);
          const newDuration = Math.max(0.1, resizeStart.duration - deltaTime);
          
          actions.updateTimelineElement(element.id, {
            startTime: newStartTime,
            duration: newDuration
          });
        } else if (isResizing === 'right') {
          // Resize from right (trim end)
          const newDuration = Math.max(0.1, resizeStart.duration + deltaTime);
          const maxDuration = duration - element.startTime;
          
          actions.updateTimelineElement(element.id, {
            duration: Math.min(newDuration, maxDuration)
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, element, duration, pixelsPerSecond, actions]);

  return (
    <div
      ref={clipRef}
      className={cn(
        'absolute rounded border-2 flex items-center px-2 cursor-move select-none transition-all duration-150',
        getClipColor(),
        isSelected && 'ring-2 ring-white ring-opacity-50',
        isDragging && 'opacity-80 scale-105',
        isResizing && 'opacity-80'
      )}
      style={{
        left: `${clipLeft}px`,
        width: `${Math.max(clipWidth, 40)}px`,
        height: `${trackHeight - 8}px`,
        top: '4px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 w-2 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
        style={{ borderRadius: '2px 0 0 2px' }}
      />

      {/* Clip content */}
      <div className="flex items-center gap-1 text-white text-xs truncate flex-1 min-w-0">
        {getClipIcon()}
        <span className="truncate">
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

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 w-2 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
        style={{ borderRadius: '0 2px 2px 0' }}
      />

      {/* Duration indicator */}
      {clipWidth > 60 && (
        <div className="absolute bottom-0 right-1 text-white/70 text-xs">
          {formatDuration(element.duration)}
        </div>
      )}
    </div>
  );
}