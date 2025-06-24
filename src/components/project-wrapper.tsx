"use client";

import React from 'react';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { ProjectSelectorDialog } from './project-selector-dialog';
import { Navbar } from "@/components/video-editor/Navbar";
import { Sidebar } from "@/components/video-editor/sidebar";
import { AssetBox } from "@/components/video-editor/AssetBox";
import VideoPlayer from "@/components/video-editor/VideoPlayer";
import { PropertiesPanel } from "@/components/video-editor/PropertiesPanel";
import Timeline from "@/components/video-editor/Timeline";
import AgentPanel from "@/components/video-editor/AgentPanel";

/**
 * ProjectWrapper Component
 * 
 * This component manages the project state and conditionally renders either
 * the project selector dialog or the main video editor interface based on
 * whether a project is currently loaded.
 */
export function ProjectWrapper() {
  const { isProjectLoaded, actions } = useVideoEditorStore();

  const handleProjectDialogChange = (open: boolean) => {
    // If the dialog is being closed but no project is loaded, keep it open
    if (!open && !isProjectLoaded) {
      return;
    }
  };

  // Show project selector if no project is loaded
  if (!isProjectLoaded) {
    return (
      <ProjectSelectorDialog 
        open={true} 
        onOpenChange={handleProjectDialogChange}
      />
    );
  }

  // Show main editor interface when project is loaded
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* left panel */}
        <div className="h-full flex flex-col border-r border-border relative min-w-70 w-70">
          {/* Dynamic Asset Box - Content changes based on sidebar selection */}
          <div className="flex-1 flex flex-col">
            {/* Horizontal Sidebar at the top */}
            <div className="flex justify-center border-b border-border">
              <Sidebar />
            </div>
            <AssetBox />
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
    </div>
  );
}