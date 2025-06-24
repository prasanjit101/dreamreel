"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { Logo } from './Logo';
import { Plus, FolderOpen, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ProjectSelectorDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProjectSelectorDialog({ open, onOpenChange }: ProjectSelectorDialogProps) {
  const { actions } = useVideoEditorStore();
  const [newProjectName, setNewProjectName] = useState('');
  const [projectList, setProjectList] = useState<Array<{ id: string; name: string; updatedAt: Date }>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load project list when dialog opens
  useEffect(() => {
    if (open) {
      const projects = actions.getProjectList();
      setProjectList(projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    }
  }, [open, actions]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsCreating(true);
    try {
      actions.newProject(newProjectName.trim());
      toast.success(`Project "${newProjectName}" created successfully`);
      setNewProjectName('');
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadProject = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const success = await actions.loadProject(id);
      if (success) {
        toast.success(`Project "${name}" loaded successfully`);
        onOpenChange?.(false);
      } else {
        toast.error('Failed to load project');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        actions.deleteProject(id);
        setProjectList(prev => prev.filter(p => p.id !== id));
        toast.success(`Project "${name}" deleted successfully`);
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newProjectName.trim()) {
      handleCreateProject();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh]" 
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <DialogTitle className="text-2xl">Welcome to Dreamreel</DialogTitle>
          <DialogDescription>
            Create a new project or open an existing one to start editing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Project Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Create New Project</h3>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="project-name" className="sr-only">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isCreating}
                  className="h-10"
                />
              </div>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="h-10 px-6"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Recent Projects</h3>
            </div>

            {projectList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No projects found</p>
                <p className="text-sm">Create your first project to get started</p>
              </div>
            ) : (
              <ScrollArea className="h-64 border rounded-lg">
                <div className="p-2 space-y-2">
                  {projectList.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{project.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadProject(project.id, project.name)}
                          disabled={isLoading}
                          className="h-8"
                        >
                          {isLoading ? 'Loading...' : 'Open'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="text-center text-sm text-muted-foreground">
          Start creating amazing videos with Dreamreel's powerful editing tools
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}