"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FolderOpen, Share } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MediaUploader } from './MediaUploader';
import { ExportButton } from './ExportButton';
import { SearchableSelect, type Option } from '@/components/searchable-select';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { convertEditorDataToExportData, validateExportData } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutBtn } from '../SignOutBtn';
import { Logo } from '../Logo';
import { VideoExportData } from '@/lib/services/remotion-lambda';

// Define aspect ratio options
const aspectRatioOptions: Option[] = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '21:9', label: '21:9' },
  { value: '2:3', label: '2:3' },
  { value: '3:2', label: '3:2' },
];

export function Navbar() {
  const { timelineElements, duration, aspectRatio, actions } = useVideoEditorStore();
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

  const handleAspectRatioChange = (newAspectRatio: string) => {
    actions.setAspectRatio(newAspectRatio);
    toast.success(`Aspect ratio changed to ${newAspectRatio}`);
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
    aspectRatio: aspectRatio, // Use aspect ratio from store
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

      {/* Center section - Project name and aspect ratio */}
      <div className="flex-1 max-w-2xl mx-8 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input 
            value="New project"
            className="bg-transparent border-none text-center text-foreground focus:bg-muted focus:border-border"
            readOnly
          />
        </div>
        
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Aspect Ratio:</span>
          <SearchableSelect
            options={aspectRatioOptions}
            value={aspectRatio}
            onValueChange={handleAspectRatioChange}
            placeholder="Select aspect ratio"
            className="w-40"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <ExportButton
          exportData={exportData as VideoExportData}
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