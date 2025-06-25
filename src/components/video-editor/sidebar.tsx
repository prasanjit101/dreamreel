"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Files,
  Layers,
} from "lucide-react";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { SidebarTab } from '@/lib/store/video-editor-store.types';


interface SidebarTool {
  id: SidebarTab;
  icon: typeof Files;
  label: string;
}

export function Sidebar() {
  const { activeSidebarTab, actions } = useVideoEditorStore();

  const tools: SidebarTool[] = [
    { id: 'files', icon: Files, label: "Files" },
    { id: 'tracks', icon: Layers, label: "Tracks" },
  ];

  const handleToolClick = (toolId: SidebarTab) => {
    actions.setActiveSidebarTab(toolId);
  };

  return (
    <div className="bg-sidebar w-full flex flex-row justify-center py-2">

      {/* Tools */}
      <div className="flex space-x-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            onClick={() => handleToolClick(tool.id)}
            className={`p-2 flex gap-1 ${
              activeSidebarTab === tool.id
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
