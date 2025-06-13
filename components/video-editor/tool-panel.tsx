"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";

export function ToolPanel() {
  return (
      <ScrollArea className="w-80 h-full bg-card border-r border-border p-4">
      <div className="space-y-4">
        <h3 className="text-foreground font-medium text-sm">Text</h3>
        
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full justify-start"
          >
            Add text
          </Button>
        </div>

        {/* Additional text controls could go here */}
        <div className="pt-4 space-y-2">
          <div className="text-muted-foreground text-xs">Text properties will appear here when text is selected</div>
        </div>
      </div>
      </ScrollArea>
  );
}
