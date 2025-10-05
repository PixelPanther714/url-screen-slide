"use client"

import html2canvas from "html2canvas"

export interface ScreenshotOptions {
  width?: number
  height?: number
  quality?: number
  useCORS?: boolean
}

export interface CaptureResult {
  dataUrl: string
  width: number
  height: number
  timestamp: number
}

export class ClientScreenshotCapture {
  static async captureElement(element: HTMLElement, options: ScreenshotOptions = {}): Promise<CaptureResult> {
    const { width = 1200, height = 800, quality = 0.9, useCORS = true } = options

    try {
      const canvas = await html2canvas(element, {
        width,
        height,
        useCORS,
        allowTaint: false,
        scale: 1,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const dataUrl = canvas.toDataURL("image/png", quality)

      return {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error)
      throw new Error("Failed to capture screenshot")
    }
  }

  static async captureViewport(options: ScreenshotOptions = {}): Promise<CaptureResult> {
    return this.captureElement(document.body, options)
  }

  static async captureIframe(iframe: HTMLIFrameElement, options: ScreenshotOptions = {}): Promise<CaptureResult> {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error("Cannot access iframe content")
      }

      return this.captureElement(iframeDoc.body, options)
    } catch (error) {
      console.error("Iframe screenshot failed:", error)
      throw new Error("Failed to capture iframe screenshot")
    }
  }
}
