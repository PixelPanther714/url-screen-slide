import { type NextRequest, NextResponse } from "next/server"
import { SlidesGenerator, type PresentationOptions } from "@/lib/slides-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses, screenshots, options } = body

    if (!analyses || !Array.isArray(analyses)) {
      return NextResponse.json({ error: "Missing or invalid analyses array" }, { status: 400 })
    }

    if (!screenshots || !Array.isArray(screenshots)) {
      return NextResponse.json({ error: "Missing or invalid screenshots array" }, { status: 400 })
    }

    const presentationOptions: PresentationOptions = {
      title: options?.title || "Webpage Analysis Report",
      template: options?.template,
      includeScreenshots: options?.includeScreenshots ?? true,
      customBranding: options?.customBranding,
    }

    const presentationId = await SlidesGenerator.createPresentation(analyses, screenshots, presentationOptions)

    return NextResponse.json({
      success: true,
      presentationId,
      message: "Presentation created successfully",
    })
  } catch (error) {
    console.error("Slides creation error:", error)
    return NextResponse.json({ error: "Failed to create presentation" }, { status: 500 })
  }
}
