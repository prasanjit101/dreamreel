"use client";

import { TopBar } from "@/components/video-editor/top-bar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { FilesPanel } from "@/components/video-editor/files-panel";
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

        <div className="h-full flex flex-col border-r border-border relative w-70">
          {/* Tool Properties Panel */}
          <FilesPanel />
          {/* Properties Panel at the bottom */}
          <div className="absolute bottom-0 w-full p-4 left-0">
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
