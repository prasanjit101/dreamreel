"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FolderOpen, Share } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MediaUploader } from './MediaUploader';
import { ExportButton } from './ExportButton';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { convertEditorDataToExportData, validateExportData } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutBtn } from '../SignOutBtn';
import { Logo } from '../Logo';


export function Navbar() {
  const { timelineElements, duration } = useVideoEditorStore();
  const { data: session } = useSession();
  const user = session?.user;

  const handleShare = () => {
    if (timelineElements.length === 0) {
      toast.error('No media to share. Please add some media files first.');
      return;
    }
    
    // TODO: Implement share functionality
    toast.info('Share functionality coming soon');
  };

  // Prepare export data - simplified approach
  const exportData = {
    clips: timelineElements.map(element => ({
      id: element.id,
      type: element.type,
      startTime: element.startTime,
      endTime: element.startTime + element.duration,
      duration: element.duration,
      src: undefined, // Will be populated based on actual element properties
      content: undefined,
      trackId: element.track?.toString() || element.id,
    })),
    aspectRatio: '16:9', // Default - should come from project settings
    fps: 30, // Default - should come from project settings
    duration: duration,
    title: 'New project',
    description: undefined,
  };

  const hasValidContent = timelineElements.length > 0;

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left section - Logo/Title */}
      <div className="flex items-center gap-4">
        <Logo />
      </div>

      {/* Center section - Project name */}
      <div className="flex-1 max-w-md mx-8">
        <Input 
          value="New project"
          className="bg-transparent border-none text-center text-foreground focus:bg-muted focus:border-border"
          readOnly
        />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <ExportButton
          exportData={exportData}
          disabled={!hasValidContent}
        />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'ghost'} size={'icon'} className="cursor-pointer">
              <Avatar>
                <AvatarFallback>{(user?.name ?? 'User').charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 flex flex-col space-y-2">
            <DropdownMenuItem>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SignOutBtn />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}