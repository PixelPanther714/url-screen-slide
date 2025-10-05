"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, FileText, Lightbulb } from "lucide-react"
import type { AnalysisResult } from "@/lib/ai-processor"

interface AIAnalysisPanelProps {
  imageData?: string
  url?: string
  onAnalysisComplete?: (analysis: AnalysisResult) => void
}

export function AIAnalysisPanel({ imageData, url, onAnalysisComplete }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!imageData || !url) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          url,
          options: {
            analysisType: "detailed",
            slideCount: 4,
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
        onAnalysisComplete?.(data.analysis)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-600" />
          AI Content Analysis
        </CardTitle>
        <CardDescription>Generate insights and slide content from captured webpage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && (
          <Button onClick={handleAnalyze} disabled={!imageData || !url || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Content...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Screenshot
              </>
            )}
          </Button>
        )}

        {analysis && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{analysis.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{analysis.summary}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Key Points
              </h4>
              <ul className="space-y-1">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {index + 1}
                    </Badge>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Insights
              </h4>
              <ul className="space-y-1">
                {analysis.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Generated Slide Content ({analysis.slideContent.length} slides)</h4>
              <div className="space-y-2">
                {analysis.slideContent.map((slide, index) => (
                  <Card key={index} className="p-3">
                    <h5 className="font-medium text-sm mb-1">{slide.title}</h5>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {slide.content.map((item, itemIndex) => (
                        <li key={itemIndex}>• {item}</li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">
              Analyze Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
