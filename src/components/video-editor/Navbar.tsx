"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FolderOpen, Share } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MediaUploader } from './MediaUploader';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
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