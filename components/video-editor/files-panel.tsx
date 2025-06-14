"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { Type, Plus } from 'lucide-react';

export function FilesPanel() {
  const { actions } = useVideoEditorStore();

  const handleAddText = () => {
    const textElement = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text' as const,
      startTime: 0,
      duration: 5,
      track: 2, // Text track
      properties: {
        text: 'Sample Text',
        fontSize: 48,
        color: '#ffffff',
        x: 0,
        y: 0
      }
    };
    
    actions.addTimelineElement(textElement);
    actions.setSelectedElement(textElement.id);
  };

  return (
    <ScrollArea className="w-full h-full bg-card border-r border-border p-4">
      <div className="space-y-4">
        <h3 className="text-foreground font-medium text-sm">Text</h3>
        
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full justify-start gap-2"
            onClick={handleAddText}
          >
            <Type className="w-4 h-4" />
            Add text
          </Button>
        </div>

        {/* Additional controls */}
        <div className="pt-4 space-y-2">
          <div className="text-muted-foreground text-xs">
            Text properties will appear in the properties panel when text is selected
          </div>
          
          <div className="text-muted-foreground text-xs mt-4">
            <strong>Timeline Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Drag clips to move them</li>
              <li>Drag clip edges to resize</li>
              <li>Double-click to split clips</li>
              <li>Clips snap to grid and other clips</li>
            </ul>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}