"use client"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      <span className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">☀️</span>
      <span className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">🌙</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
