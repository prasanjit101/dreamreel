"use client";

import { ScrollArea } from "../ui/scroll-area";
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { FilesPanel } from './FilesPanel';
import { TracksPanel } from './TracksPanel';
import { cn } from "@/lib/utils";

interface AssetBoxProps {
  className?: string;
}

/**
 * AssetBox Component
 * 
 * This component serves as a dynamic content container that displays different
 * panels based on the currently selected sidebar tab. It acts as the main
 * content area for the left sidebar, switching between Files and Tracks panels.
 */
export function AssetBox({ className }: AssetBoxProps) {
  const { activeSidebarTab } = useVideoEditorStore();

  const renderContent = () => {
    switch (activeSidebarTab) {
      case 'files':
        return <FilesPanel />;
      case 'tracks':
        return <TracksPanel />;
      default:
        return <FilesPanel />; // Fallback to files panel
    }
  };

  return (
    <div className={cn("w-full h-full p-1 bg-card border-r border-t border-border", className)}>
      {renderContent()}
    </div>
  );
}