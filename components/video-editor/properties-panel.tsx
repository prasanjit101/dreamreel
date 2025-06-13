"use client";

import { ScrollArea } from "../ui/scroll-area";

export function PropertiesPanel() {
  return (
      <ScrollArea className="w-full bg-card border-l border-border p-4">
      <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 bg-muted-foreground/20 rounded-full"></div>
        </div>
        
        <div className="space-y-2">
                  <h3 className="text-foreground font-medium">No item selected</h3>
                  <p className="text-muted-foreground text-sm">Select an item to see its properties</p>
        </div>
      </div>
      </ScrollArea>
  );
}
