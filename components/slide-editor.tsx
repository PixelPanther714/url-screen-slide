"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Play,
  Save,
  Download,
  Type,
  ImageIcon,
  BarChart3,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  FolderOpen,
  FileText,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SlideTemplates } from "./slide-templates"
import { SlideThemes, type Theme } from "./slide-themes"
import { ExportDialog } from "./export-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePresentations } from "@/hooks/use-presentations"
import { useToast } from "@/hooks/use-toast"

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

export function SlideEditor() {
  const {
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
  } = usePresentations()

  const { toast } = useToast()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [showPresentationManager, setShowPresentationManager] = useState(false)

  const currentSlide = currentPresentation?.slides[currentSlideIndex]

  const handleCreateNewPresentation = () => {
    createPresentation()
    setCurrentSlideIndex(0)
    setShowPresentationManager(false)
    toast({
      title: "New presentation created",
      description: "You can now start adding slides and content.",
    })
  }

  const handleLoadPresentation = (presentation: any) => {
    setCurrentPresentation(presentation)
    setCurrentSlideIndex(0)
    setShowPresentationManager(false)
    toast({
      title: "Presentation loaded",
      description: `Opened "${presentation.title}"`,
    })
  }

  const handleSavePresentation = () => {
    if (!currentPresentation) return

    updatePresentation(currentPresentation)
    toast({
      title: "Presentation saved",
      description: "Your changes have been saved locally.",
    })
  }

  const handleImportPresentation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    importPresentation(file)
      .then((imported) => {
        setCurrentPresentation(imported)
        setCurrentSlideIndex(0)
        toast({
          title: "Presentation imported",
          description: `Successfully imported "${imported.title}"`,
        })
      })
      .catch((error) => {
        toast({
          title: "Import failed",
          description: error.message,
          variant: "destructive",
        })
      })

    // Reset the input
    event.target.value = ""
  }

  const handleExportPresentation = () => {
    if (!currentPresentation) return

    exportPresentation(currentPresentation)
    toast({
      title: "Presentation exported",
      description: `Successfully exported "${currentPresentation.title}"`,
    })
  }

  const addSlide = () => {
    if (!currentPresentation) return

    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${currentPresentation.slides.length + 1}`,
      elements: [],
      background: currentPresentation.theme.background,
    }

    const updatedPresentation = {
      ...currentPresentation,
      slides: [...currentPresentation.slides, newSlide],
    }

    updatePresentation(updatedPresentation)
    setCurrentSlideIndex(currentPresentation.slides.length)
  }

  const deleteSlide = (index: number) => {
    if (!currentPresentation || currentPresentation.slides.length <= 1) return

    const updatedSlides = currentPresentation.slides.filter((_, i) => i !== index)
    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    }

    updatePresentation(updatedPresentation)
    setCurrentSlideIndex(Math.max(0, index - 1))
  }

  const duplicateSlide = (index: number) => {
    if (!currentPresentation) return

    const slideToClone = currentPresentation.slides[index]
    const newSlide: Slide = {
      ...slideToClone,
      id: Date.now().toString(),
      title: `${slideToClone.title} (Copy)`,
      elements: slideToClone.elements.map((el) => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}`,
      })),
    }

    const newSlides = [...currentPresentation.slides]
    newSlides.splice(index + 1, 0, newSlide)

    const updatedPresentation = {
      ...currentPresentation,
      slides: newSlides,
    }

    updatePresentation(updatedPresentation)
    setCurrentSlideIndex(index + 1)
  }

  const addElement = (type: SlideElement["type"]) => {
    if (!currentPresentation || !currentSlide) return

    const newElement: SlideElement = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "New Text" : type === "image" ? "/abstract-geometric-shapes.png" : "Chart Data",
      x: 100,
      y: 100,
      width: type === "text" ? 300 : 200,
      height: type === "text" ? 50 : 150,
      fontSize: type === "text" ? 16 : undefined,
      color: currentPresentation.theme.text,
    }

    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, elements: [...slide.elements, newElement] } : slide,
    )

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    }

    updatePresentation(updatedPresentation)
    setSelectedElement(newElement.id)
  }

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? {
            ...slide,
            elements: slide.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
          }
        : slide,
    )

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    }

    updatePresentation(updatedPresentation)
  }

  const deleteElement = (elementId: string) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? {
            ...slide,
            elements: slide.elements.filter((el) => el.id !== elementId),
          }
        : slide,
    )

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
    }

    updatePresentation(updatedPresentation)
    setSelectedElement(null)
  }

  const applyTemplate = (template: any) => {
    if (!currentPresentation) return

    const newSlides = template.slides.map((slide: any) => ({
      ...slide,
      id: Date.now().toString() + Math.random(),
      background: currentPresentation.theme.background,
      elements: slide.elements.map((el: any) => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        color:
          el.color === "#ea580c"
            ? currentPresentation.theme.primary
            : el.color === "#4b5563"
              ? currentPresentation.theme.text
              : el.color,
      })),
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: [...currentPresentation.slides, ...newSlides],
    }

    updatePresentation(updatedPresentation)
    setCurrentSlideIndex(currentPresentation.slides.length)
  }

  const applyTheme = (theme: Theme) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map((slide) => ({
      ...slide,
      background: theme.background,
      elements: slide.elements.map((el) => ({
        ...el,
        color:
          el.color === currentPresentation.theme.primary
            ? theme.primary
            : el.color === currentPresentation.theme.text
              ? theme.text
              : el.color === currentPresentation.theme.secondary
                ? theme.secondary
                : el.color,
      })),
    }))

    const updatedPresentation = {
      ...currentPresentation,
      theme,
      slides: updatedSlides,
    }

    updatePresentation(updatedPresentation)
  }

  useEffect(() => {
    if (!isPresentationMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault()
          if (currentPresentation) {
            setCurrentSlideIndex(Math.min(currentPresentation.slides.length - 1, currentSlideIndex + 1))
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))
          break
        case "Escape":
          e.preventDefault()
          setIsPresentationMode(false)
          break
        case "Home":
          e.preventDefault()
          setCurrentSlideIndex(0)
          break
        case "End":
          e.preventDefault()
          if (currentPresentation) {
            setCurrentSlideIndex(currentPresentation.slides.length - 1)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPresentationMode, currentSlideIndex, currentPresentation])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading presentations...</p>
        </div>
      </div>
    )
  }

  if (!currentPresentation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Presentation Found</h2>
          <p className="text-muted-foreground">Create a new presentation to get started.</p>
          <Button onClick={handleCreateNewPresentation}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Presentation
          </Button>
        </div>
      </div>
    )
  }

  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl max-h-[90vh] relative">
          <div
            className="w-full h-full slide-canvas flex items-center justify-center relative transition-all duration-300 ease-in-out"
            style={{ backgroundColor: currentSlide?.background }}
          >
            {currentSlide?.elements.map((element, index) => (
              <div
                key={element.id}
                className="absolute animate-in fade-in duration-500"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {element.type === "text" && (
                  <div className="w-full h-full flex items-center text-balance">{element.content}</div>
                )}
                {element.type === "image" && (
                  <img
                    src={element.content || "/placeholder.svg"}
                    alt="Slide content"
                    className="w-full h-full object-cover rounded shadow-lg"
                  />
                )}
                {element.type === "chart" && (
                  <div className="w-full h-full bg-white/90 rounded flex items-center justify-center text-gray-600 shadow-lg">
                    <BarChart3 className="w-12 h-12" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPresentationMode(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-1" />
              Exit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentSlideIndex(Math.min(currentPresentation.slides.length - 1, currentSlideIndex + 1))
              }
              disabled={currentSlideIndex === currentPresentation.slides.length - 1}
              className="text-white hover:bg-white/20 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            {currentSlideIndex + 1} / {currentPresentation.slides.length}
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-black/30">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / currentPresentation.slides.length) * 100}%` }}
            />
          </div>

          <div className="absolute bottom-6 left-6 text-white/70 text-sm bg-black/50 backdrop-blur-sm rounded px-3 py-2">
            <div>← → Space: Navigate</div>
            <div>Esc: Exit • Home/End: First/Last</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-sidebar-foreground">Slide Editor</h1>
            <Button variant="ghost" size="sm" onClick={() => setShowPresentationManager(true)}>
              <FolderOpen className="w-4 h-4" />
            </Button>
          </div>
          <Input
            value={currentPresentation?.title || ""}
            onChange={(e) => {
              if (!currentPresentation) return
              const updatedPresentation = {
                ...currentPresentation,
                title: e.target.value,
              }
              updatePresentation(updatedPresentation)
            }}
            className="text-sm mb-3"
            placeholder="Presentation title"
          />
          <div className="flex gap-2 mb-3">
            <Button size="sm" onClick={() => setIsPresentationMode(true)}>
              <Play className="w-4 h-4 mr-2" />
              Present
            </Button>
            <Button size="sm" variant="outline" onClick={handleSavePresentation}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <ExportDialog presentation={currentPresentation!}>
              <Button size="sm" variant="outline" disabled={!currentPresentation}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </ExportDialog>
          </div>
          <div className="flex gap-2">
            <SlideTemplates onSelectTemplate={applyTemplate} />
            <SlideThemes onSelectTheme={applyTheme} currentTheme={currentPresentation?.theme} />
          </div>
        </div>

        {/* Slide Thumbnails */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sidebar-foreground">Slides</h2>
            <Button size="sm" onClick={addSlide}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {currentPresentation?.slides.map((slide, index) => (
              <div key={slide.id} className="group relative">
                <div
                  className={cn("slide-thumbnail p-2 text-xs", index === currentSlideIndex && "active")}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="text-center font-medium mb-1">{slide.title}</div>
                  <div
                    className="w-full h-16 rounded text-[8px] relative overflow-hidden"
                    style={{ backgroundColor: slide.background }}
                  >
                    {slide.elements.slice(0, 3).map((element) => (
                      <div
                        key={element.id}
                        className="absolute text-[6px] overflow-hidden"
                        style={{
                          left: `${(element.x / 800) * 100}%`,
                          top: `${(element.y / 450) * 100}%`,
                          width: `${(element.width / 800) * 100}%`,
                          height: `${(element.height / 450) * 100}%`,
                          fontSize: "6px",
                          color: element.color,
                        }}
                      >
                        {element.type === "text" && element.content}
                        {element.type === "image" && <div className="bg-muted w-full h-full rounded-sm" />}
                        {element.type === "chart" && <BarChart3 className="w-2 h-2" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Actions */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateSlide(index)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {currentPresentation.slides.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(index)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Element Tools */}
        <div className="p-4 border-t border-sidebar-border">
          <h3 className="font-semibold text-sidebar-foreground mb-3">Add Elements</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement("text")}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement("image")}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Image</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement("chart")}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Chart</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <Input
                value={currentSlide?.title || ""}
                onChange={(e) => {
                  if (!currentPresentation) return
                  const updatedSlides = currentPresentation.slides.map((slide, index) =>
                    index === currentSlideIndex ? { ...slide, title: e.target.value } : slide,
                  )
                  const updatedPresentation = {
                    ...currentPresentation,
                    slides: updatedSlides,
                  }
                  updatePresentation(updatedPresentation)
                }}
                className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Slide {currentSlideIndex + 1} of {currentPresentation?.slides.length}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div
              className="slide-canvas relative mx-auto"
              style={{
                width: "800px",
                height: "450px",
                backgroundColor: currentSlide?.background,
              }}
              onClick={() => setSelectedElement(null)}
            >
              {currentSlide?.elements.map((element) => (
                <div
                  key={element.id}
                  className={cn(
                    "absolute cursor-pointer border-2 border-transparent hover:border-primary/50",
                    selectedElement === element.id && "border-primary ring-2 ring-primary/20",
                  )}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement(element.id)
                  }}
                >
                  {element.type === "text" && (
                    <div
                      className="w-full h-full flex items-center p-2"
                      style={{
                        fontSize: element.fontSize ? `${element.fontSize}px` : "16px",
                        fontWeight: element.fontWeight,
                        color: element.color,
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === "image" && (
                    <img
                      src={element.content || "/placeholder.svg"}
                      alt="Slide content"
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  {element.type === "chart" && (
                    <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                  )}

                  {selectedElement === element.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteElement(element.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-80 bg-sidebar border-l border-sidebar-border p-4">
          <h3 className="font-semibold text-sidebar-foreground mb-4">Element Properties</h3>

          {(() => {
            const element = currentSlide?.elements.find((el) => el.id === selectedElement)
            if (!element) return null

            return (
              <div className="space-y-4">
                {element.type === "text" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-sidebar-foreground">Content</label>
                      <Textarea
                        value={element.content}
                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sidebar-foreground">Font Size</label>
                      <Input
                        type="number"
                        value={element.fontSize || 16}
                        onChange={(e) => updateElement(element.id, { fontSize: Number.parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sidebar-foreground">Color</label>
                      <Input
                        type="color"
                        value={element.color || "#4b5563"}
                        onChange={(e) => updateElement(element.id, { color: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </>
                )}

                {element.type === "image" && (
                  <div>
                    <label className="text-sm font-medium text-sidebar-foreground">Image URL</label>
                    <Input
                      value={element.content}
                      onChange={(e) => updateElement(element.id, { content: e.target.value })}
                      className="mt-1"
                      placeholder="Enter image URL"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-sidebar-foreground">Width</label>
                    <Input
                      type="number"
                      value={element.width}
                      onChange={(e) => updateElement(element.id, { width: Number.parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sidebar-foreground">Height</label>
                    <Input
                      type="number"
                      value={element.height}
                      onChange={(e) => updateElement(element.id, { height: Number.parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-sidebar-foreground">X Position</label>
                    <Input
                      type="number"
                      value={element.x}
                      onChange={(e) => updateElement(element.id, { x: Number.parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sidebar-foreground">Y Position</label>
                    <Input
                      type="number"
                      value={element.y}
                      onChange={(e) => updateElement(element.id, { y: Number.parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Presentation Manager Dialog */}
      <Dialog open={showPresentationManager} onOpenChange={setShowPresentationManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Presentations</DialogTitle>
            <DialogDescription>Create new presentations or open existing ones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleCreateNewPresentation} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Create New Presentation
              </Button>
              <Button variant="outline" onClick={handleExportPresentation} disabled={!currentPresentation}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" asChild>
                <label htmlFor="import-presentation" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </label>
              </Button>
              <input
                id="import-presentation"
                type="file"
                accept=".json"
                onChange={handleImportPresentation}
                className="hidden"
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recent Presentations</h4>
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleLoadPresentation(presentation)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{presentation.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {presentation.slides.length} slides • Updated {presentation.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {currentPresentation?.id === presentation.id && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Current</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
