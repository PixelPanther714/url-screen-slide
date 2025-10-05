import type { ScreenshotRequest, ScreenshotResponse } from "@/app/api/screenshot/route"

export class ScreenshotService {
  static async captureWebpage(url: string, options?: ScreenshotRequest["options"]): Promise<ScreenshotResponse> {
    try {
      console.log(" ScreenshotService: Starting capture for", url)

      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          options,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(" ScreenshotService: HTTP error", response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log(" ScreenshotService: Capture successful", result.screenshots?.length || 0, "screenshots")
      return result
    } catch (error) {
      console.error(" ScreenshotService: Capture failed", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        screenshots: [],
      }
    }
  }

  static async captureMultiplePages(
    urls: string[],
    options?: ScreenshotRequest["options"],
  ): Promise<ScreenshotResponse[]> {
    const promises = urls.map((url) => this.captureWebpage(url, options))
    return Promise.all(promises)
  }

  static dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })
  }

  static async uploadScreenshot(dataUrl: string, filename: string): Promise<string> {
    const blob = this.dataUrlToBlob(dataUrl)
    const formData = new FormData()
    formData.append("file", blob, filename)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const result = await response.json()
    return result.url
  }
}
