import { type NextRequest, NextResponse } from "next/server"
import { SlidesGenerator, type PresentationOptions } from "@/lib/slides-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses, screenshots, options } = body

    if (!analyses || !Array.isArray(analyses)) {
      return NextResponse.json({ error: "Missing or invalid analyses array" }, { status: 400 })
    }

    const presentationOptions: PresentationOptions = {
      title: options?.title || "Webpage Analysis Report",
      template: options?.template,
      includeScreenshots: options?.includeScreenshots ?? true,
      customBranding: options?.customBranding,
    }

    const preview = SlidesGenerator.generatePresentationPreview(analyses, screenshots || [], presentationOptions)

    return NextResponse.json({ success: true, preview })
  } catch (error) {
    console.error("Preview generation error:", error)
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 })
  }
}
