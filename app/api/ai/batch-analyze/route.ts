import { type NextRequest, NextResponse } from "next/server"
import { AIProcessor, type ProcessingOptions } from "@/lib/ai-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { screenshots, options } = body

    if (!screenshots || !Array.isArray(screenshots)) {
      return NextResponse.json({ error: "Missing or invalid screenshots array" }, { status: 400 })
    }

    console.log(" Batch AI Analysis API: Starting batch analysis of", screenshots.length, "screenshots")

    const processingOptions: ProcessingOptions = {
      analysisType: options?.analysisType || "presentation",
      focusAreas: options?.focusAreas || ["content", "design", "user experience"],
      slideCount: options?.slideCount || 5,
    }

    const analyses = await AIProcessor.batchAnalyze(screenshots, processingOptions)

    const validAnalyses = analyses.filter((analysis) => AIProcessor.validateAnalysis(analysis))
    const totalProcessingTime = analyses.reduce((sum, analysis) => sum + analysis.processingTime, 0)
    const averageConfidence = analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / analyses.length

    console.log(" Batch AI Analysis API: Completed", validAnalyses.length, "valid analyses")

    return NextResponse.json({
      success: true,
      analyses,
      metadata: {
        totalAnalyses: analyses.length,
        validAnalyses: validAnalyses.length,
        totalProcessingTime,
        averageConfidence,
        totalSlides: analyses.reduce((sum, analysis) => sum + analysis.slideContent.length, 0),
      },
    })
  } catch (error) {
    console.error(" Batch AI Analysis API: Batch analysis failed", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze screenshots",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
