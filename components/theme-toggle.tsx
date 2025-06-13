"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
    const { theme, setTheme, mounted, isDark } = useTheme()

    // Prevent hydration mismatch
    if (!mounted) {
      return (
            <Button variant="outline" size="icon" disabled>
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <TooltipProvider>
          <DropdownMenu>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                              <span className="sr-only">Toggle theme</span>
                          </Button>
                      </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Toggle theme</p>
                  </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>System</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </TooltipProvider>
  )
}
