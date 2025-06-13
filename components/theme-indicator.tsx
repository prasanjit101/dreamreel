"use client"

import { useTheme } from "@/hooks/use-theme"
import { Badge } from "@/components/ui/badge"
import { Monitor, Moon, Sun } from "lucide-react"

export function ThemeIndicator() {
  const { theme, resolvedTheme, mounted } = useTheme()

  if (!mounted) return null

  const getThemeIcon = () => {
    switch (resolvedTheme) {
      case "dark":
        return <Moon className="w-3 h-3" />
      case "light":
        return <Sun className="w-3 h-3" />
      default:
        return <Monitor className="w-3 h-3" />
    }
  }

  const getThemeLabel = () => {
    if (theme === "system") {
      return `System (${resolvedTheme})`
    }
    return theme?.charAt(0).toUpperCase() + theme?.slice(1)
  }

  return (
    <Badge variant="outline" className="gap-1">
      {getThemeIcon()}
      {getThemeLabel()}
    </Badge>
  )
}
