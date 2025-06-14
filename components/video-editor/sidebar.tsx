"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Image, 
  Type, 
  Music, 
  Layers, 
  Upload,
  Menu,
  Files,
  Undo2,
  Redo2,
} from "lucide-react";

export function Sidebar() {
  const tools = [
    { icon: Files, label: "Files", active: true },
    { icon: Layers, label: "Tracks", active: false },
  ];

  return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col">

      <Separator className="bg-sidebar-border" />

      {/* Tools */}
      <div className="flex-1 p-3 space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool.label}
            variant="ghost"
            size="sm"
            className={`w-full p-2 h-auto flex flex-col gap-1 ${
              tool.active 
                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <tool.icon className="w-5 h-5" />
            <span className="text-xs">{tool.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
