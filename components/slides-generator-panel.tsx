"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Presentation, Eye, Download } from "lucide-react"
import type { AnalysisResult } from "@/lib/ai-processor"

interface SlidesGeneratorPanelProps {
  analyses: AnalysisResult[]
  screenshots: Array<{ imageData: string; url: string }>
  onPresentationCreated?: (presentationId: string) => void
}

export function SlidesGeneratorPanel({ analyses, screenshots, onPresentationCreated }: SlidesGeneratorPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [presentationId, setPresentationId] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [options, setOptions] = useState({
    title: "Webpage Analysis Report",
    includeScreenshots: true,
    customBranding: false,
  })

  const handlePreview = async () => {
    setIsPreviewLoading(true)
    try {
      const response = await fetch("/api/slides/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyses,
          screenshots,
          options,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPreview(data.preview)
      }
    } catch (error) {
      console.error("Preview failed:", error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/slides/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyses,
          screenshots,
          options,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPresentationId(data.presentationId)
        onPresentationCreated?.(data.presentationId)
      }
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = analyses.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Presentation className="h-5 w-5 text-orange-600" />
          Generate Slides
        </CardTitle>
        <CardDescription>Create a Google Slides presentation from your analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="presentation-title">Presentation Title</Label>
            <Input
              id="presentation-title"
              value={options.title}
              onChange={(e) => setOptions((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter presentation title"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-screenshots">Include Screenshots</Label>
            <Switch
              id="include-screenshots"
              checked={options.includeScreenshots}
              onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeScreenshots: checked }))}
            />
          </div>

          {canGenerate && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Ready to Generate</div>
              <div className="text-xs text-muted-foreground">
                {analyses.length} analysis{analyses.length > 1 ? "es" : ""} •{screenshots.length} screenshot
                {screenshots.length > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={!canGenerate || isPreviewLoading}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            {isPreviewLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>

          <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Presentation className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {preview && (
          <Card className="p-3">
            <h4 className="font-medium mb-2">Presentation Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Slides:</span>
                <Badge variant="secondary">{preview.slideCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Estimated Duration:</span>
                <span className="text-muted-foreground">{preview.estimatedDuration}</span>
              </div>
              <div>
                <span className="font-medium">Structure:</span>
                <ul className="mt-1 space-y-1">
                  {preview.structure.slice(0, 5).map((slide: any, index: number) => (
                    <li key={index} className="text-xs text-muted-foreground ml-2">
                      • {slide.title} ({slide.contentPreview})
                    </li>
                  ))}
                  {preview.structure.length > 5 && (
                    <li className="text-xs text-muted-foreground ml-2">
                      ... and {preview.structure.length - 5} more slides
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {presentationId && (
          <Card className="p-3 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Presentation Created!</h4>
                <p className="text-sm text-green-600">ID: {presentationId}</p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Open
              </Button>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
