"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FolderOpen, Save } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutBtn } from '../SignOutBtn';
import { Logo } from '../Logo';
import { ProjectSelectorDialog } from '../project-selector-dialog';

export function Navbar() {
  const { timelineElements, duration, projectName, actions } = useVideoEditorStore();
  const { data: session } = useSession();
  const user = session?.user;
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const handleExport = () => {
    if (timelineElements.length === 0) {
      toast.error('No media to export. Please add some media files first.');
      return;
    }
    
    // TODO: Implement actual export functionality with Remotion
    toast.info('Export functionality will be implemented with Remotion rendering');
  };

  const handleSaveProject = () => {
    try {
      actions.saveProject();
      toast.success('Project saved successfully');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleOpenProject = () => {
    setShowProjectDialog(true);
  };

  const handleProjectDialogChange = (open: boolean) => {
    setShowProjectDialog(open);
  };

  return (
    <>
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        {/* Left section - Logo/Title */}
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        {/* Center section - Project name */}
        <div className="flex-1 max-w-md mx-8">
          <div className="text-center text-foreground font-medium">
            {projectName || 'Untitled Project'}
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={handleSaveProject}
            variant="outline"
            className="h-9"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button 
            size="sm"
            onClick={handleOpenProject}
            variant="outline"
            className="h-9"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Open Project
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={timelineElements.length === 0}
            className="h-9"
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

      {/* Project Selector Dialog */}
      <ProjectSelectorDialog 
        open={showProjectDialog} 
        onOpenChange={handleProjectDialogChange}
      />
    </>
  );
}