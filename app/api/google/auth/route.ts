import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuthService } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  try {
    const authService = new GoogleAuthService()
    const authUrl = authService.generateAuthUrl()

    return NextResponse.json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error("Auth URL generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate auth URL",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: "Authorization code is required" }, { status: 400 })
    }

    const authService = new GoogleAuthService()
    const tokens = await authService.exchangeCodeForTokens(code)

    return NextResponse.json({
      success: true,
      tokens,
    })
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to exchange code for tokens",
      },
      { status: 500 },
    )
  }
}
