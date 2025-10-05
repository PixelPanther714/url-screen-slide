import { type NextRequest, NextResponse } from "next/server"
import { GoogleAPIService } from "@/lib/google-apis"
import type { GoogleTokens } from "@/lib/google-auth"

export async function POST(request: NextRequest) {
  try {
    const { action, tokens, ...params } = await request.json()

    if (!tokens) {
      return NextResponse.json({ success: false, error: "Google tokens are required" }, { status: 401 })
    }

    const googleAPI = new GoogleAPIService()

    switch (action) {
      case "create":
        const { title } = params
        const result = await googleAPI.createPresentation(tokens as GoogleTokens, title)
        return NextResponse.json({ success: true, ...result })

      case "addSlide":
        const { presentationId, imageUrl, title: slideTitle, notes } = params
        const slideId = await googleAPI.addSlideWithImage(
          tokens as GoogleTokens,
          presentationId,
          imageUrl,
          slideTitle,
          notes,
        )
        return NextResponse.json({ success: true, slideId })

      case "addText":
        const { presentationId: textPresentationId, slideId: textSlideId, text, x, y } = params
        await googleAPI.addTextToSlide(tokens as GoogleTokens, textPresentationId, textSlideId, text, x, y)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Slides API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Slides operation failed",
      },
      { status: 500 },
    )
  }
}
