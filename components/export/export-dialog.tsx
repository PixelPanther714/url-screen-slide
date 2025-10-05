"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExportService, type ExportOptions, type ExportResult } from "@/lib/export-service"
import type { SlideData } from "@/lib/slides-generator"
import type { AnalysisResult } from "@/lib/ai-processor"

interface ExportDialogProps {
  slides: SlideData[]
  analysis: AnalysisResult
  trigger?: React.ReactNode
}

export function ExportDialog({ slides, analysis, trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportResult, setExportResult] = useState<ExportResult | null>(null)
  const [options, setOptions] = useState<ExportOptions>({
    format: "markdown",
    includeScreenshots: true,
    includeNotes: true,
  })

  const formatOptions = [
    {
      value: "markdown",
      label: "Markdown",
      description: "Text-based format, great for documentation",
      icon: "📝",
    },
    {
      value: "html",
      label: "HTML",
      description: "Web page format with styling",
      icon: "🌐",
    },
    {
      value: "json",
      label: "JSON",
      description: "Structured data format for developers",
      icon: "📊",
    },
    {
      value: "pdf",
      label: "PDF",
      description: "Portable document format (coming soon)",
      icon: "📄",
      disabled: true,
    },
    {
      value: "pptx",
      label: "PowerPoint",
      description: "Microsoft PowerPoint format (requires Google Slides)",
      icon: "📈",
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await ExportService.exportPresentation(slides, analysis, options)

      clearInterval(progressInterval)
      setExportProgress(100)
      setExportResult(result)

      if (result.success && result.downloadUrl) {
        // Trigger download
        const link = document.createElement("a")
        link.href = result.downloadUrl
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up blob URL
        setTimeout(() => {
          URL.revokeObjectURL(result.downloadUrl!)
        }, 1000)
      }
    } catch (error) {
      console.error("Export failed:", error)
      setExportResult({
        success: false,
        filename: "",
        error: "Export failed. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const resetDialog = () => {
    setExportProgress(0)
    setExportResult(null)
    setIsExporting(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <span className="mr-2">📤</span>
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
          <DialogDescription>Choose your export format and options for "{analysis.title}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{slides.length}</div>
                  <div className="text-sm text-muted-foreground">Slides</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{analysis.keyPoints.length}</div>
                  <div className="text-sm text-muted-foreground">Key Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{analysis.insights.length}</div>
                  <div className="text-sm text-muted-foreground">Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as any })}
              className="grid grid-cols-1 gap-3"
            >
              {formatOptions.map((format) => (
                <div key={format.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={format.value} id={format.value} disabled={format.disabled} />
                  <Label
                    htmlFor={format.value}
                    className={`flex-1 cursor-pointer ${format.disabled ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <span className="text-xl">{format.icon}</span>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {format.label}
                          {format.disabled && <Badge variant="secondary">Coming Soon</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="screenshots"
                  checked={options.includeScreenshots}
                  onCheckedChange={(checked) => setOptions({ ...options, includeScreenshots: checked as boolean })}
                />
                <Label htmlFor="screenshots" className="cursor-pointer">
                  Include screenshots and images
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notes"
                  checked={options.includeNotes}
                  onCheckedChange={(checked) => setOptions({ ...options, includeNotes: checked as boolean })}
                />
                <Label htmlFor="notes" className="cursor-pointer">
                  Include speaker notes and annotations
                </Label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-spin">⏳</span>
                Generating {options.format.toUpperCase()} export...
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Export Result */}
          {exportResult && (
            <div
              className={`p-4 rounded-lg ${exportResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              {exportResult.success ? (
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>Export completed! Download started automatically.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <span>❌</span>
                  <span>{exportResult.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleExport} disabled={isExporting} className="flex-1">
              {isExporting ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Exporting...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Export as {options.format.toUpperCase()}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
