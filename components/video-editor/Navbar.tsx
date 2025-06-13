"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Share } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MediaUploader } from './MediaUploader';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { toast } from 'sonner';

export function Navbar() {
  const { timelineElements, duration } = useVideoEditorStore();

  const handleExport = () => {
    if (timelineElements.length === 0) {
      toast.error('No media to export. Please add some media files first.');
      return;
    }
    
    // TODO: Implement actual export functionality with Remotion
    toast.info('Export functionality will be implemented with Remotion rendering');
  };

  const handleShare = () => {
    if (timelineElements.length === 0) {
      toast.error('No media to share. Please add some media files first.');
      return;
    }
    
    // TODO: Implement share functionality
    toast.info('Share functionality coming soon');
  };

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left section - Logo/Title */}
      <div className="flex items-center gap-4">
        <div className="text-foreground font-semibold text-lg">
          Dreamreel
        </div>
      </div>

      {/* Center section - Project name */}
      <div className="flex-1 max-w-md mx-8">
        <Input 
          value="Untitled video"
          className="bg-transparent border-none text-center text-foreground focus:bg-muted focus:border-border"
          readOnly
        />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <MediaUploader variant="button" />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShare}
          disabled={timelineElements.length === 0}
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          disabled={timelineElements.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <ThemeToggle />
      </div>
    </div>
  );
}