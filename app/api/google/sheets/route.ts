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
        const result = await googleAPI.createSpreadsheet(tokens as GoogleTokens, title)
        return NextResponse.json({ success: true, ...result })

      case "write":
        const { spreadsheetId, range, values } = params
        await googleAPI.writeToSheet(tokens as GoogleTokens, spreadsheetId, range, values)
        return NextResponse.json({ success: true })

      case "read":
        const { spreadsheetId: readId, range: readRange } = params
        const data = await googleAPI.readFromSheet(tokens as GoogleTokens, readId, readRange)
        return NextResponse.json({ success: true, data })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Sheets API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sheets operation failed",
      },
      { status: 500 },
    )
  }
}
