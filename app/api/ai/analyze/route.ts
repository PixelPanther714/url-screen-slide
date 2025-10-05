import { type NextRequest, NextResponse } from "next/server"
import { AIProcessor, type ProcessingOptions } from "@/lib/ai-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, url, options } = body

    if (!imageData || !url) {
      return NextResponse.json({ error: "Missing required fields: imageData and url" }, { status: 400 })
    }

    console.log(" AI Analysis API: Starting analysis for", url)

    const processingOptions: ProcessingOptions = {
      analysisType: options?.analysisType || "presentation",
      focusAreas: options?.focusAreas || ["content", "design", "user experience"],
      slideCount: options?.slideCount || 5,
    }

    const analysis = await AIProcessor.analyzeScreenshot(imageData, url, processingOptions)

    if (!AIProcessor.validateAnalysis(analysis)) {
      console.warn(" AI Analysis API: Analysis quality below threshold, using fallback")
    }

    console.log(" AI Analysis API: Analysis completed successfully")

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        processingTime: analysis.processingTime,
        confidence: analysis.confidence,
        slideCount: analysis.slideContent.length,
      },
    })
  } catch (error) {
    console.error(" AI Analysis API: Analysis failed", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze screenshot",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
