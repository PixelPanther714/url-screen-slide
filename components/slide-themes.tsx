"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Palette } from "lucide-react"

interface Theme {
  id: string
  name: string
  background: string
  primary: string
  secondary: string
  text: string
}

const themes: Theme[] = [
  {
    id: "warm",
    name: "Warm Orange",
    background: "#fefce8",
    primary: "#ea580c",
    secondary: "#f97316",
    text: "#4b5563",
  },
  {
    id: "cool-blue",
    name: "Cool Blue",
    background: "#f0f9ff",
    primary: "#0ea5e9",
    secondary: "#3b82f6",
    text: "#1e293b",
  },
  {
    id: "forest",
    name: "Forest Green",
    background: "#f0fdf4",
    primary: "#16a34a",
    secondary: "#22c55e",
    text: "#1f2937",
  },
  {
    id: "purple",
    name: "Royal Purple",
    background: "#faf5ff",
    primary: "#9333ea",
    secondary: "#a855f7",
    text: "#374151",
  },
  {
    id: "rose",
    name: "Rose Pink",
    background: "#fff1f2",
    primary: "#e11d48",
    secondary: "#f43f5e",
    text: "#374151",
  },
  {
    id: "minimal",
    name: "Minimal Gray",
    background: "#ffffff",
    primary: "#374151",
    secondary: "#6b7280",
    text: "#111827",
  },
]

interface SlideThemesProps {
  onSelectTheme: (theme: Theme) => void
  currentTheme?: Theme
}

export function SlideThemes({ onSelectTheme, currentTheme }: SlideThemesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Theme</DialogTitle>
          <DialogDescription>Select a color theme for your presentation</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                currentTheme?.id === theme.id ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
              onClick={() => onSelectTheme(theme)}
            >
              <div className="space-y-3">
                <div className="text-sm font-medium text-center">{theme.name}</div>
                <div className="w-full h-20 rounded border" style={{ backgroundColor: theme.background }}>
                  <div className="p-2 space-y-1">
                    <div className="h-3 w-3/4 rounded" style={{ backgroundColor: theme.primary }} />
                    <div className="h-2 w-1/2 rounded" style={{ backgroundColor: theme.text }} />
                    <div className="h-2 w-2/3 rounded" style={{ backgroundColor: theme.secondary }} />
                  </div>
                </div>
                <div className="flex gap-1 justify-center">
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.background }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.text }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { themes, type Theme }
