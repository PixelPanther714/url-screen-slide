"use client"

import { useState, useEffect } from "react"
import { themes, type Theme } from "@/components/slide-themes"

interface SlideElement {
  id: string
  type: "text" | "image" | "chart"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontWeight?: string
  color?: string
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background: string
}

interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: Theme
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "slide-presentations"

export function usePresentations() {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load presentations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const presentationsWithDates = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }))
        setPresentations(presentationsWithDates)

        // Set the most recently updated as current
        if (presentationsWithDates.length > 0) {
          const mostRecent = presentationsWithDates.sort(
            (a: Presentation, b: Presentation) => b.updatedAt.getTime() - a.updatedAt.getTime(),
          )[0]
          setCurrentPresentation(mostRecent)
        }
      } else {
        // Create default presentation if none exists
        const defaultPresentation = createDefaultPresentation()
        setPresentations([defaultPresentation])
        setCurrentPresentation(defaultPresentation)
        saveToStorage([defaultPresentation])
      }
    } catch (error) {
      console.error("Error loading presentations:", error)
      // Fallback to default presentation
      const defaultPresentation = createDefaultPresentation()
      setPresentations([defaultPresentation])
      setCurrentPresentation(defaultPresentation)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createDefaultPresentation = (): Presentation => ({
    id: "default-" + Date.now(),
    title: "My First Presentation",
    theme: themes[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    slides: [
      {
        id: "slide-1",
        title: "Welcome Slide",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Welcome to Our Presentation",
            x: 50,
            y: 200,
            width: 600,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            color: "#ea580c",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Creating amazing slides made simple",
            x: 50,
            y: 300,
            width: 600,
            height: 40,
            fontSize: 24,
            color: "#4b5563",
          },
        ],
        background: "#fefce8",
      },
    ],
  })

  const saveToStorage = (presentationList: Presentation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presentationList))
    } catch (error) {
      console.error("Error saving presentations:", error)
    }
  }

  const createPresentation = (title = "New Presentation"): Presentation => {
    const newPresentation: Presentation = {
      id: "presentation-" + Date.now(),
      title,
      theme: themes[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      slides: [
        {
          id: "slide-" + Date.now(),
          title: "Title Slide",
          elements: [],
          background: themes[0].background,
        },
      ],
    }

    const updatedPresentations = [...presentations, newPresentation]
    setPresentations(updatedPresentations)
    setCurrentPresentation(newPresentation)
    saveToStorage(updatedPresentations)

    return newPresentation
  }

  const updatePresentation = (updatedPresentation: Presentation) => {
    const presentationWithUpdatedTime = {
      ...updatedPresentation,
      updatedAt: new Date(),
    }

    const updatedPresentations = presentations.map((p) =>
      p.id === updatedPresentation.id ? presentationWithUpdatedTime : p,
    )

    setPresentations(updatedPresentations)
    if (currentPresentation?.id === updatedPresentation.id) {
      setCurrentPresentation(presentationWithUpdatedTime)
    }
    saveToStorage(updatedPresentations)

    return presentationWithUpdatedTime
  }

  const deletePresentation = (presentationId: string) => {
    const updatedPresentations = presentations.filter((p) => p.id !== presentationId)
    setPresentations(updatedPresentations)

    if (currentPresentation?.id === presentationId) {
      const nextPresentation = updatedPresentations.length > 0 ? updatedPresentations[0] : null
      setCurrentPresentation(nextPresentation)
    }

    saveToStorage(updatedPresentations)
  }

  const duplicatePresentation = (presentationId: string): Presentation | null => {
    const presentationToDuplicate = presentations.find((p) => p.id === presentationId)
    if (!presentationToDuplicate) return null

    const duplicatedPresentation: Presentation = {
      ...presentationToDuplicate,
      id: "presentation-" + Date.now(),
      title: `${presentationToDuplicate.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      slides: presentationToDuplicate.slides.map((slide) => ({
        ...slide,
        id: "slide-" + Date.now() + "-" + Math.random(),
        elements: slide.elements.map((element) => ({
          ...element,
          id: "element-" + Date.now() + "-" + Math.random(),
        })),
      })),
    }

    const updatedPresentations = [...presentations, duplicatedPresentation]
    setPresentations(updatedPresentations)
    saveToStorage(updatedPresentations)

    return duplicatedPresentation
  }

  const exportPresentation = (presentation: Presentation) => {
    try {
      const dataStr = JSON.stringify(presentation, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `${presentation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error("Error exporting presentation:", error)
    }
  }

  const importPresentation = (file: File): Promise<Presentation> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedData = JSON.parse(content)

          // Validate the imported data structure
          if (!importedData.id || !importedData.title || !importedData.slides) {
            throw new Error("Invalid presentation file format")
          }

          const importedPresentation: Presentation = {
            ...importedData,
            id: "imported-" + Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
            title: `${importedData.title} (Imported)`,
          }

          const updatedPresentations = [...presentations, importedPresentation]
          setPresentations(updatedPresentations)
          saveToStorage(updatedPresentations)

          resolve(importedPresentation)
        } catch (error) {
          reject(new Error("Failed to import presentation: " + (error as Error).message))
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      const defaultPresentation = createDefaultPresentation()
      setPresentations([defaultPresentation])
      setCurrentPresentation(defaultPresentation)
      saveToStorage([defaultPresentation])
    } catch (error) {
      console.error("Error clearing data:", error)
    }
  }

  return {
    presentations,
    currentPresentation,
    isLoading,
    setCurrentPresentation,
    createPresentation,
    updatePresentation,
    deletePresentation,
    duplicatePresentation,
    exportPresentation,
    importPresentation,
    clearAllData,
  }
}
