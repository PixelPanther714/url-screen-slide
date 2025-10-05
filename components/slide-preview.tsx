"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { SlideData } from "@/lib/slides-generator"

interface SlidePreviewProps {
  slides: SlideData[]
  isGenerating?: boolean
  onGenerate?: () => void
  onEdit?: (slideId: string) => void
}

export function SlidePreview({ slides, isGenerating = false, onGenerate, onEdit }: SlidePreviewProps) {
  const estimatedDuration = Math.ceil(slides.length * 1.2)

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Presentation Preview
          </CardTitle>
          <CardDescription>
            {slides.length} slides • Estimated duration: {estimatedDuration} minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{slides.length}</div>
              <div className="text-sm text-muted-foreground">Total Slides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{estimatedDuration}m</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{slides.filter((s) => s.screenshot).length}</div>
              <div className="text-sm text-muted-foreground">Screenshots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {slides.filter((s) => s.type === "ai-generated").length}
              </div>
              <div className="text-sm text-muted-foreground">AI Slides</div>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-spin">⏳</span>
                Generating presentation...
              </div>
              <Progress value={65} className="w-full" />
            </div>
          )}

          {!isGenerating && onGenerate && (
            <Button onClick={onGenerate} className="w-full mt-4">
              <span className="mr-2">🚀</span>
              Generate Full Presentation
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Slide Structure */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Slide Structure</h3>
        <div className="grid gap-3">
          {slides.map((slide, index) => (
            <Card key={slide.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{slide.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {slide.type.replace("-", " ")}
                      </Badge>
                      {slide.screenshot && (
                        <Badge variant="outline" className="text-xs">
                          📷 Screenshot
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Layout: {slide.layout.replace("-", " ")} •
                      {typeof slide.content === "object" && slide.content.bullets
                        ? ` ${slide.content.bullets.length} points`
                        : typeof slide.content === "object" && slide.content.keyPoints
                          ? ` ${slide.content.keyPoints.length} key points`
                          : " Rich content"}
                    </p>

                    {slide.notes && (
                      <p className="text-xs text-muted-foreground italic">Notes: {slide.notes.substring(0, 100)}...</p>
                    )}
                  </div>

                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(slide.id)} className="flex-shrink-0">
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
