"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Player() {
  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto border-2 border-dashed border-border">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-foreground font-medium">Click to upload</h3>
          <p className="text-muted-foreground text-sm">Or drag and drop files here</p>
        </div>
      </div>
    </div>
  );
}
