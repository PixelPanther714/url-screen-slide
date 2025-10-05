"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileImage, FileText, Presentation, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SlideElement {
  id: string
  type: "text" | "image" | "chart"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontWeight?: string
  color?: string
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background: string
}

interface ExportDialogProps {
  presentation: any
  children: React.ReactNode
}

export function ExportDialog({ presentation, children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"pdf" | "images" | "html" | "json">("pdf")
  const [includeNotes, setIncludeNotes] = useState(false)
  const [imageQuality, setImageQuality] = useState<"high" | "medium" | "low">("high")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToPDF = async () => {
    try {
      setIsExporting(true)

      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.")
      }

      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${presentation.title}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .slide {
              width: 210mm;
              height: 148.5mm;
              page-break-after: always;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 20mm;
              box-sizing: border-box;
            }
            .slide:last-child {
              page-break-after: avoid;
            }
            .slide-content {
              width: 100%;
              height: 100%;
              position: relative;
            }
            .element {
              position: absolute;
              word-wrap: break-word;
            }
            .element img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            @media print {
              .slide {
                width: 100vw;
                height: 100vh;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${presentation.slides
            .map(
              (slide, index) => `
            <div class="slide" style="background-color: ${slide.background};">
              <div class="slide-content">
                ${slide.elements
                  .map(
                    (element) => `
                  <div class="element" style="
                    left: ${(element.x / 800) * 100}%;
                    top: ${(element.y / 450) * 100}%;
                    width: ${(element.width / 800) * 100}%;
                    height: ${(element.height / 450) * 100}%;
                    font-size: ${element.fontSize ? `${(element.fontSize / 800) * 100}vw` : "16px"};
                    font-weight: ${element.fontWeight || "normal"};
                    color: ${element.color || "#000"};
                    display: flex;
                    align-items: center;
                  ">
                    ${
                      element.type === "text"
                        ? element.content.replace(/\n/g, "<br>")
                        : element.type === "image"
                          ? `<img src="${element.content}" alt="Slide image" />`
                          : '<div style="background: #f0f0f0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 8px;">📊 Chart</div>'
                    }
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)

      toast({
        title: "PDF Export Started",
        description: "Your browser's print dialog should open. Choose 'Save as PDF' to export.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToImages = async () => {
    try {
      setIsExporting(true)

      // Create canvas for each slide
      for (let i = 0; i < presentation.slides.length; i++) {
        const slide = presentation.slides[i]
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) continue

        // Set canvas size based on quality
        const scale = imageQuality === "high" ? 2 : imageQuality === "medium" ? 1.5 : 1
        canvas.width = 800 * scale
        canvas.height = 450 * scale
        ctx.scale(scale, scale)

        // Draw background
        ctx.fillStyle = slide.background
        ctx.fillRect(0, 0, 800, 450)

        // Draw elements
        for (const element of slide.elements) {
          if (element.type === "text") {
            ctx.fillStyle = element.color || "#000"
            ctx.font = `${element.fontWeight || "normal"} ${element.fontSize || 16}px Arial`

            const lines = element.content.split("\n")
            lines.forEach((line, lineIndex) => {
              ctx.fillText(line, element.x, element.y + (element.fontSize || 16) * (lineIndex + 1))
            })
          } else if (element.type === "image") {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
              ctx.drawImage(img, element.x, element.y, element.width, element.height)
            }
            img.src = element.content
          }
        }

        // Download the canvas as image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${presentation.title}_slide_${i + 1}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      }

      toast({
        title: "Images Exported",
        description: `${presentation.slides.length} slide images have been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToHTML = async () => {
    try {
      setIsExporting(true)

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${presentation.title}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #000;
              color: #fff;
              overflow: hidden;
            }
            .presentation {
              width: 100vw;
              height: 100vh;
              position: relative;
            }
            .slide {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              display: none;
              align-items: center;
              justify-content: center;
            }
            .slide.active {
              display: flex;
            }
            .slide-content {
              width: 80vw;
              height: 45vw;
              max-width: 800px;
              max-height: 450px;
              position: relative;
              border-radius: 8px;
              overflow: hidden;
            }
            .element {
              position: absolute;
              word-wrap: break-word;
            }
            .element img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 4px;
            }
            .controls {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 10px;
              background: rgba(0,0,0,0.7);
              padding: 10px 20px;
              border-radius: 25px;
              backdrop-filter: blur(10px);
            }
            .controls button {
              background: rgba(255,255,255,0.2);
              border: none;
              color: white;
              padding: 8px 16px;
              border-radius: 15px;
              cursor: pointer;
              transition: background 0.2s;
            }
            .controls button:hover {
              background: rgba(255,255,255,0.3);
            }
            .controls button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .slide-counter {
              position: fixed;
              top: 20px;
              right: 20px;
              background: rgba(0,0,0,0.7);
              padding: 8px 16px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="presentation">
            ${presentation.slides
              .map(
                (slide, index) => `
              <div class="slide ${index === 0 ? "active" : ""}" data-slide="${index}">
                <div class="slide-content" style="background-color: ${slide.background};">
                  ${slide.elements
                    .map(
                      (element) => `
                    <div class="element" style="
                      left: ${(element.x / 800) * 100}%;
                      top: ${(element.y / 450) * 100}%;
                      width: ${(element.width / 800) * 100}%;
                      height: ${(element.height / 450) * 100}%;
                      font-size: ${element.fontSize ? `${(element.fontSize / 800) * 100}vw` : "1vw"};
                      font-weight: ${element.fontWeight || "normal"};
                      color: ${element.color || "#000"};
                      display: flex;
                      align-items: center;
                    ">
                      ${
                        element.type === "text"
                          ? element.content.replace(/\n/g, "<br>")
                          : element.type === "image"
                            ? `<img src="${element.content}" alt="Slide image" />`
                            : '<div style="background: rgba(255,255,255,0.1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 2vw;">📊</div>'
                      }
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="slide-counter">
            <span id="current-slide">1</span> / ${presentation.slides.length}
          </div>
          
          <div class="controls">
            <button onclick="previousSlide()" id="prev-btn">← Previous</button>
            <button onclick="nextSlide()" id="next-btn">Next →</button>
          </div>

          <script>
            let currentSlide = 0;
            const totalSlides = ${presentation.slides.length};

            function showSlide(n) {
              const slides = document.querySelectorAll('.slide');
              slides.forEach(slide => slide.classList.remove('active'));
              slides[n].classList.add('active');
              
              document.getElementById('current-slide').textContent = n + 1;
              document.getElementById('prev-btn').disabled = n === 0;
              document.getElementById('next-btn').disabled = n === totalSlides - 1;
            }

            function nextSlide() {
              if (currentSlide < totalSlides - 1) {
                currentSlide++;
                showSlide(currentSlide);
              }
            }

            function previousSlide() {
              if (currentSlide > 0) {
                currentSlide--;
                showSlide(currentSlide);
              }
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
              if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousSlide();
              }
            });

            // Initialize
            showSlide(0);
          </script>
        </body>
        </html>
      `

      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "HTML Exported",
        description: "Your presentation has been exported as an interactive HTML file.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export HTML. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = async () => {
    try {
      setIsExporting(true)

      const dataStr = JSON.stringify(presentation, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `${presentation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "JSON Exported",
        description: "Your presentation data has been exported as a JSON file.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export JSON. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async () => {
    switch (exportFormat) {
      case "pdf":
        await exportToPDF()
        break
      case "images":
        await exportToImages()
        break
      case "html":
        await exportToHTML()
        break
      case "json":
        await exportToJSON()
        break
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
          <DialogDescription>Choose your export format and options</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="images">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    PNG Images
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4" />
                    Interactive HTML
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JSON Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportFormat === "images" && (
            <div className="space-y-2">
              <Label htmlFor="quality">Image Quality</Label>
              <Select value={imageQuality} onValueChange={(value: any) => setImageQuality(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (2x)</SelectItem>
                  <SelectItem value="medium">Medium (1.5x)</SelectItem>
                  <SelectItem value="low">Low (1x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(exportFormat === "pdf" || exportFormat === "html") && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notes"
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
              />
              <Label htmlFor="notes">Include speaker notes</Label>
            </div>
          )}

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="font-medium mb-1">Export Details:</div>
            <div className="text-muted-foreground">
              {exportFormat === "pdf" && "Creates a printable PDF document"}
              {exportFormat === "images" && `Exports ${presentation.slides.length} PNG images`}
              {exportFormat === "html" && "Creates an interactive web presentation"}
              {exportFormat === "json" && "Exports raw presentation data"}
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
