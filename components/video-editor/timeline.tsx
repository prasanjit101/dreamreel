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

export function Timeline() {
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
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider 
              defaultValue={[50]} 
              max={100} 
              step={1}
              className="w-20"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-12 bg-card flex items-center justify-center gap-4 border-b border-border">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2">
          <Play className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2">
          <SkipForward className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 ml-4">
          <span className="text-foreground text-sm font-mono">00:00</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground text-sm font-mono">00:01</span>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="flex-1 p-4">
        <div className="relative">
          {/* Timeline ruler */}
          <div className="h-8 flex items-end border-b border-border mb-4">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="flex-1 relative">
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
          <div className="absolute top-0 left-0 w-px h-full bg-primary z-10">
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
