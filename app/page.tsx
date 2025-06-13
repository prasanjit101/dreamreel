"use client";

import { TopBar } from "@/components/video-editor/top-bar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { ToolPanel } from "@/components/video-editor/tool-panel";
import { Player } from "@/components/video-editor/player";
import { PropertiesPanel } from "@/components/video-editor/properties-panel";
import { Timeline } from "@/components/video-editor/timeline";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar with Tools */}
        <Sidebar />

        <div className="h-full flex max-w-full flex-col border-r border-border relative">
          {/* Tool Properties Panel */}
          <ToolPanel />
          {/* Properties Panel at the bottom */}
          <div className="absolute bottom-0 left-0 w-full">
            <PropertiesPanel />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Main Player Area */}
          <Player />
          <Timeline />
        </div>


      </div>

      {/* Bottom Timeline */}
    </div>
  );
}
