"use client";

import { Navbar } from "@/components/video-editor/Navbar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { FilesPanel } from "@/components/video-editor/files-panel";
import VideoPlayer from "@/components/video-editor/VideoPlayer";
import { PropertiesPanel } from "@/components/video-editor/PropertiesPanel";
import Timeline from "@/components/video-editor/Timeline";
import { Toaster } from "sonner";
import AgentPanel from "@/components/video-editor/AgentPanel";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar with Tools */}
        <Sidebar />

        <div className="h-full flex flex-col border-r border-border relative min-w-70 w-70">
          {/* Tool Properties Panel */}
          <div className="flex-1 overflow-auto">
            <FilesPanel />
          </div>
          {/* Properties Panel at the bottom */}
          <div className="flex-1 overflow-auto border-t border-border">
            <PropertiesPanel />
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-4xl">
          {/* Main Player Area */}
          <VideoPlayer />
          <Timeline />
        </div>

        {/* Right Sidebar with Properties */}
        <div className="w-65 border-l border-border flex flex-col">
          <AgentPanel />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}