import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export interface ScreenshotRequest {
  url: string
  options?: {
    width?: number
    height?: number
    fullPage?: boolean
    waitFor?: number
    selector?: string
  }
}

export interface ScreenshotResponse {
  success: boolean
  screenshots: Array<{
    id: string
    dataUrl: string
    width: number
    height: number
    selector?: string
    timestamp: number
  }>
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ScreenshotRequest = await request.json()
    const { url, options = {} } = body

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    const { width = 1200, height = 800, fullPage = false, waitFor = 2000, selector } = options

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    // Set viewport
    await page.setViewport({ width, height })

    // Navigate to URL
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    // Wait for additional loading
    // await page.waitForTimeout(waitFor)

    const screenshots: ScreenshotResponse["screenshots"] = []

    if (selector) {
      // Capture specific element
      const element = await page.$(selector)
      if (element) {
        const screenshot = await element.screenshot({
          type: "png",
          encoding: "base64",
        })

        screenshots.push({
          id: `element-${Date.now()}`,
          dataUrl: `data:image/png;base64,${screenshot}`,
          width,
          height,
          selector,
          timestamp: Date.now(),
        })
      }
    } else {
      // Capture full page or viewport
      const screenshot = await page.screenshot({
        type: "png",
        encoding: "base64",
        fullPage,
      })

      screenshots.push({
        id: `page-${Date.now()}`,
        dataUrl: `data:image/png;base64,${screenshot}`,
        width,
        height,
        timestamp: Date.now(),
      })

      // Also capture key elements automatically
      const keySelectors = ["header", "nav", "main", ".hero", ".content", "article", "section"]

      for (const sel of keySelectors) {
        try {
          const element = await page.$(sel)
          if (element) {
            const elementScreenshot = await element.screenshot({
              type: "png",
              encoding: "base64",
            })

            screenshots.push({
              id: `${sel.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
              dataUrl: `data:image/png;base64,${elementScreenshot}`,
              width,
              height,
              selector: sel,
              timestamp: Date.now(),
            })
          }
        } catch (error) {
          // Skip if element not found
          console.log(`Element ${sel} not found, skipping`)
        }
      }
    }

    await browser.close()

    return NextResponse.json({
      success: true,
      screenshots,
    })
  } catch (error) {
    console.error("Screenshot API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Screenshot failed",
        screenshots: [],
      },
      { status: 500 },
    )
  }
}
