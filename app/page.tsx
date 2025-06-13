"use client";

import { Navbar } from "@/components/video-editor/Navbar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { FilesPanel } from "@/components/video-editor/files-panel";
import VideoPlayer from "@/components/video-editor/VideoPlayer";
import { PropertiesPanel } from "@/components/video-editor/PropertiesPanel";
import Timeline from "@/components/video-editor/Timeline";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <Navbar />

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
          <VideoPlayer />
          <Timeline />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}