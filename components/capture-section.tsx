"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScreenshotService } from "@/lib/screenshot-service"
import { AIProcessor, type AnalysisResult } from "@/lib/ai-processor"
import { SlidesGenerator, type PresentationOptions } from "@/lib/slides-generator"
import { SlidePreview } from "@/components/slide-preview"
import { GoogleLogin } from "@/components/auth/google-login"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import type { ScreenshotResponse } from "@/app/api/screenshot/route"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function CaptureSection() {
  const { isAuthenticated, tokens, login } = useGoogleAuth()
  const [url, setUrl] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)
  const [screenshots, setScreenshots] = useState<ScreenshotResponse["screenshots"]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false)
  const [slidePreview, setSlidePreview] = useState<any>(null)
  const [presentationId, setPresentationId] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleCapture = async () => {
    if (!url) return

    setIsCapturing(true)
    setError(null)
    setCaptureProgress(0)

    try {
      // Validate URL
      new URL(url)
      setCaptureProgress(10)

      console.log(" Starting webpage capture for:", url)

      // Capture screenshots
      const result = await ScreenshotService.captureWebpage(url, {
        width: 1200,
        height: 800,
        fullPage: false,
        waitFor: 3000,
      })

      setCaptureProgress(40)

      if (!result.success) {
        throw new Error(result.error || "Screenshot capture failed")
      }

      console.log(" Screenshots captured:", result.screenshots.length)
      setScreenshots(result.screenshots)
      setCaptureProgress(60)

      // Analyze the main screenshot with AI
      if (result.screenshots.length > 0) {
        console.log(" Starting AI analysis...")
        const mainScreenshot = result.screenshots[0]

        const analysisResult = await AIProcessor.analyzeScreenshot(mainScreenshot.dataUrl, url, {
          analysisType: "presentation",
          slideCount: 5,
          focusAreas: ["content", "design", "user experience"],
        })

        console.log(" AI analysis complete:", analysisResult.title)
        setAnalysis(analysisResult)
        setCaptureProgress(90)
      }

      setCaptureProgress(100)
      setCaptureComplete(true)
    } catch (error) {
      console.error(" Capture error:", error)
      setError(error instanceof Error ? error.message : "Capture failed")
    } finally {
      setIsCapturing(false)
    }
  }

  const handleGenerateSlides = async () => {
    if (!analysis || screenshots.length === 0) return

    setIsGeneratingSlides(true)

    try {
      console.log(" Generating slide preview...")

      // Prepare data for slide generation
      const screenshotData = screenshots.map((screenshot) => ({
        imageData: screenshot.dataUrl,
        url: url,
      }))

      const presentationOptions: PresentationOptions = {
        title: `Website Analysis: ${new URL(url).hostname}`,
        includeScreenshots: true,
        template: SlidesGenerator.getTemplateOptions().professional,
      }

      // Generate preview first
      const preview = SlidesGenerator.generatePresentationPreview([analysis], screenshotData, presentationOptions)

      setSlidePreview(preview)
      console.log(" Slide preview generated:", preview.slideCount, "slides")
    } catch (error) {
      console.error(" Slide generation failed:", error)
      setError("Failed to generate slides. Please try again.")
    } finally {
      setIsGeneratingSlides(false)
    }
  }

  const handleCreatePresentation = async () => {
    if (!analysis || screenshots.length === 0) return

    // Check if user is authenticated for Google services
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    setIsGeneratingSlides(true)

    try {
      console.log(" Creating final presentation with Google integration...")

      const screenshotData = screenshots.map((screenshot) => ({
        imageData: screenshot.dataUrl,
        url: url,
      }))

      const presentationOptions: PresentationOptions = {
        title: `Website Analysis: ${new URL(url).hostname}`,
        includeScreenshots: true,
        template: SlidesGenerator.getTemplateOptions().professional,
      }

      // Create the actual presentation with Google Slides integration
      const newPresentationId = await SlidesGenerator.createPresentation(
        [analysis],
        screenshotData,
        presentationOptions,
      )

      setPresentationId(newPresentationId)
      console.log(" Presentation created:", newPresentationId)
    } catch (error) {
      console.error(" Presentation creation failed:", error)
      setError("Failed to create presentation. Please try again.")
    } finally {
      setIsGeneratingSlides(false)
    }
  }

  const handleAuthSuccess = (newTokens: any) => {
    login(newTokens)
    setShowAuthDialog(false)
    // Automatically create presentation after auth
    setTimeout(() => {
      handleCreatePresentation()
    }, 1000)
  }

  const resetCapture = () => {
    setCaptureComplete(false)
    setScreenshots([])
    setAnalysis(null)
    setError(null)
    setCaptureProgress(0)
    setSlidePreview(null)
    setPresentationId(null)
    setIsGeneratingSlides(false)
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Start Capturing Content</h2>
            <p className="text-lg text-muted-foreground">
              Enter any URL to begin the automated content capture and AI analysis process
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌐</span>
                Web Content Capture & AI Analysis
              </CardTitle>
              <CardDescription>
                Paste a URL below to capture screenshots and generate AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  disabled={isCapturing}
                />
                <Button onClick={handleCapture} disabled={!url || isCapturing} className="px-6">
                  {isCapturing ? (
                    <>
                      <span className="mr-2 animate-spin">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Capture & Analyze
                    </>
                  )}
                </Button>
              </div>

              {isCapturing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="animate-spin">⏳</span>
                    {captureProgress < 40
                      ? "Capturing webpage screenshots..."
                      : captureProgress < 60
                        ? "Processing captured content..."
                        : captureProgress < 90
                          ? "Running AI analysis..."
                          : "Finalizing results..."}
                  </div>
                  <Progress value={captureProgress} className="w-full" />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <span className="text-destructive">⚠️</span>
                  <span className="text-sm text-destructive">{error}</span>
                  <Button variant="ghost" size="sm" onClick={resetCapture} className="ml-auto">
                    Try Again
                  </Button>
                </div>
              )}

              {captureComplete && screenshots.length > 0 && (
                <div className="space-y-6 p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>✅</span>
                    Content captured and analyzed successfully!
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="secondary">
                      <span className="mr-1">🖼️</span>
                      {screenshots.length} Screenshots
                    </Badge>
                    <Badge variant="secondary">
                      <span className="mr-1">🤖</span>
                      AI Analysis Complete
                    </Badge>
                    <Badge variant="secondary">
                      <span className="mr-1">📊</span>
                      {analysis?.slideContent.length || 0} Slides Ready
                    </Badge>
                    <Badge variant="secondary">
                      <span className="mr-1">💡</span>
                      {analysis?.insights.length || 0} Insights
                    </Badge>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🤖 AI Analysis Preview</h3>
                    <h4 className="font-medium text-sm mb-2">{analysis.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{analysis.summary}</p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Key Points:</h5>
                        <ul className="space-y-1">
                          {analysis.keyPoints.slice(0, 3).map((point, i) => (
                            <li key={i} className="text-muted-foreground">
                              • {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Insights:</h5>
                        <ul className="space-y-1">
                          {analysis.insights.slice(0, 3).map((insight, i) => (
                            <li key={i} className="text-muted-foreground">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                    {screenshots.slice(0, 6).map((screenshot) => (
                      <div key={screenshot.id} className="relative group">
                        <img
                          src={screenshot.dataUrl || "/placeholder.svg"}
                          alt={`Screenshot ${screenshot.selector || "page"}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <span className="text-white text-xs text-center px-2">
                            {screenshot.selector || "Full Page"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {!slidePreview && !presentationId && (
                      <Button className="flex-1" onClick={handleGenerateSlides} disabled={isGeneratingSlides}>
                        {isGeneratingSlides ? (
                          <>
                            <span className="mr-2 animate-spin">⏳</span>
                            Generating Preview...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🎯</span>
                            Preview Slides ({analysis?.slideContent.length || 0} slides)
                          </>
                        )}
                      </Button>
                    )}

                    {slidePreview && !presentationId && (
                      <Button className="flex-1" onClick={handleCreatePresentation} disabled={isGeneratingSlides}>
                        {isGeneratingSlides ? (
                          <>
                            <span className="mr-2 animate-spin">⏳</span>
                            Creating Presentation...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🚀</span>
                            {isAuthenticated ? "Create Google Slides" : "Sign In & Create Slides"}
                          </>
                        )}
                      </Button>
                    )}

                    {presentationId && (
                      <Button className="flex-1" variant="default">
                        <span className="mr-2">✅</span>
                        Presentation Created: {presentationId}
                      </Button>
                    )}

                    <Button variant="outline" onClick={resetCapture}>
                      <span className="mr-2">🔄</span>
                      New Capture
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {slidePreview && (
            <SlidePreview
              slides={slidePreview.structure}
              isGenerating={isGeneratingSlides}
              onGenerate={presentationId ? undefined : handleCreatePresentation}
            />
          )}

          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Google Authentication Required</DialogTitle>
                <DialogDescription>
                  To create presentations in Google Slides, please connect your Google account.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleAuthSuccess} onError={(error) => console.error(error)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  )
}
