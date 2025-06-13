"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Download, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar() {
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
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="secondary" size="sm">
          Discard
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
