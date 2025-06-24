"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

/**
 * Enhanced theme hook that provides additional utilities for the Dreamreel app
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const isLight = resolvedTheme === "light"
  const isSystem = theme === "system"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const setDarkTheme = () => setTheme("dark")
  const setLightTheme = () => setTheme("light")
  const setSystemTheme = () => setTheme("system")

  return {
    theme,
    resolvedTheme,
    setTheme,
    mounted,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    setSystemTheme,
  }
}
