import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuthService } from "@/lib/google-auth"

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json()

    if (!refresh_token) {
      return NextResponse.json({ success: false, error: "Refresh token is required" }, { status: 400 })
    }

    const authService = new GoogleAuthService()
    const tokens = await authService.refreshAccessToken(refresh_token)

    return NextResponse.json({
      success: true,
      tokens,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh tokens",
      },
      { status: 500 },
    )
  }
}
