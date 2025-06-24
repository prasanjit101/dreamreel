"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { Type, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

export function Assetsbox({ className }: { className?: string }) {

  return (
    <ScrollArea className={cn("w-full h-full bg-card border-r border-border p-4", className)}>
      <div className="space-y-4">
        <h3 className="text-foreground font-medium text-sm">Files</h3>
        
        {/* All files for the current project will be listed here. The files can be added into the timeline or not. Any imported files will go here first, only if there is atleast 1 media file from beforehand. If not, then the first video media will get added to the player/timeline first  */}
      </div>
    </ScrollArea>
  );
}