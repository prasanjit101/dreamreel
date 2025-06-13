"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Trash2,
  Split,
  Copy,
  ZoomIn,
  ZoomOut,
  Volume2,
  ScissorsLineDashed,
  Scissors
} from "lucide-react";
import { useVideoEditorStore } from "@/lib/store/video-editor-store";
import { useState } from "react";

export function Timeline() {
  const { isPlaying, currentTime, duration, volume, isFileLoaded, actions } = useVideoEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  if (!isFileLoaded) {
    return null; // Do not render timeline if no file is loaded
  }

  const handlePlayheadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const timelineRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (timelineRect) {
      const newX = e.clientX - timelineRect.left;
      const percentage = Math.max(0, Math.min(1, newX / timelineRect.width));
      actions.seek(percentage * duration);
    }
  };

  const handlePlayheadDragStart = () => {
    setIsDragging(true);
  };

  const handlePlayheadDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-64 bg-card border-t border-border">
      {/* Timeline Controls */}
      <div className="h-12 bg-muted border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
            <Scissors className="w-4 h-4 -rotate-90" />
          </Button>
        </div>

        {/* Playback Controls */}
        <div className="h-12 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground p-2"
            onClick={() => isPlaying ? actions.pause() : actions.play()}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-foreground text-sm font-mono">
              {formatTime(currentTime)}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground text-sm font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Slider 
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={([value]) => actions.setVolume(value / 100)}
          />
        </div>
      </div>

      {/* Timeline Track */}
      <div className="flex-1 p-4">
        <div
          className="relative h-full"
          onMouseMove={handlePlayheadDrag}
          onMouseUp={handlePlayheadDragEnd}
          onMouseLeave={handlePlayheadDragEnd}
        >
          {/* Timeline ruler */}
          <div className="h-8 flex items-end border-b border-border mb-4">
            {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
              <div
                key={i}
                className="relative"
                style={{ flex: `0 0 ${100 / (Math.ceil(duration) + 1)}%` }}
              >
                <div className="absolute bottom-0 left-0 w-px h-2 bg-border"></div>
                {i % 5 === 0 && (
                  <div className="absolute bottom-3 left-0 text-xs text-muted-foreground">
                    {i}s
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 w-px h-full bg-primary z-10 cursor-col-resize"
            style={{ left: `${(currentTime / duration) * 100}%` }}
            onMouseDown={handlePlayheadDragStart}
          >
            <div className="w-3 h-3 bg-primary rotate-45 transform -translate-x-1/2 -translate-y-1"></div>
          </div>

          {/* Track area */}
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded border border-border flex items-center px-2">
              <span className="text-muted-foreground text-xs">Video Track</span>
            </div>
            <div className="h-12 bg-muted rounded border border-border flex items-center px-2">
              <span className="text-muted-foreground text-xs">Audio Track</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time (MM:SS)
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
