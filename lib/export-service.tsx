import type { AnalysisResult } from "./ai-processor"
import type { SlideData } from "./slides-generator"

export interface ExportOptions {
  format: "pdf" | "pptx" | "json" | "markdown" | "html"
  includeScreenshots: boolean
  includeNotes: boolean
  template?: string
}

export interface ExportResult {
  success: boolean
  downloadUrl?: string
  filename: string
  error?: string
}

export class ExportService {
  static async exportPresentation(
    slides: SlideData[],
    analysis: AnalysisResult,
    options: ExportOptions,
  ): Promise<ExportResult> {
    console.log(" ExportService: Starting export", options.format)

    try {
      switch (options.format) {
        case "json":
          return this.exportAsJSON(slides, analysis, options)
        case "markdown":
          return this.exportAsMarkdown(slides, analysis, options)
        case "html":
          return this.exportAsHTML(slides, analysis, options)
        case "pdf":
          return this.exportAsPDF(slides, analysis, options)
        case "pptx":
          return this.exportAsPowerPoint(slides, analysis, options)
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }
    } catch (error) {
      console.error(" ExportService: Export failed", error)
      return {
        success: false,
        filename: "",
        error: error instanceof Error ? error.message : "Export failed",
      }
    }
  }

  private static exportAsJSON(slides: SlideData[], analysis: AnalysisResult, options: ExportOptions): ExportResult {
    const exportData = {
      metadata: {
        title: analysis.title,
        exportedAt: new Date().toISOString(),
        slideCount: slides.length,
        format: "json",
        options,
      },
      analysis: {
        title: analysis.title,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        insights: analysis.insights,
        confidence: analysis.confidence,
        processingTime: analysis.processingTime,
      },
      slides: slides.map((slide) => ({
        id: slide.id,
        type: slide.type,
        title: slide.title,
        content: slide.content,
        layout: slide.layout,
        notes: options.includeNotes ? slide.notes : undefined,
        screenshot: options.includeScreenshots ? slide.screenshot : undefined,
      })),
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const downloadUrl = URL.createObjectURL(blob)
    const filename = `${this.sanitizeFilename(analysis.title)}_export.json`

    return {
      success: true,
      downloadUrl,
      filename,
    }
  }

  private static exportAsMarkdown(slides: SlideData[], analysis: AnalysisResult, options: ExportOptions): ExportResult {
    let markdown = `# ${analysis.title}\n\n`
    markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`
    markdown += `## Summary\n\n${analysis.summary}\n\n`

    if (analysis.keyPoints.length > 0) {
      markdown += `## Key Points\n\n`
      analysis.keyPoints.forEach((point) => {
        markdown += `- ${point}\n`
      })
      markdown += `\n`
    }

    if (analysis.insights.length > 0) {
      markdown += `## Insights\n\n`
      analysis.insights.forEach((insight) => {
        markdown += `- ${insight}\n`
      })
      markdown += `\n`
    }

    markdown += `## Presentation Slides\n\n`

    slides.forEach((slide, index) => {
      markdown += `### Slide ${index + 1}: ${slide.title}\n\n`

      if (Array.isArray(slide.content)) {
        slide.content.forEach((item) => {
          markdown += `- ${item}\n`
        })
      } else if (typeof slide.content === "object" && slide.content.bullets) {
        slide.content.bullets.forEach((bullet: string) => {
          markdown += `- ${bullet}\n`
        })
      } else if (typeof slide.content === "string") {
        markdown += `${slide.content}\n`
      }

      if (options.includeNotes && slide.notes) {
        markdown += `\n**Speaker Notes:** ${slide.notes}\n`
      }

      markdown += `\n---\n\n`
    })

    const blob = new Blob([markdown], { type: "text/markdown" })
    const downloadUrl = URL.createObjectURL(blob)
    const filename = `${this.sanitizeFilename(analysis.title)}_presentation.md`

    return {
      success: true,
      downloadUrl,
      filename,
    }
  }

  private static exportAsHTML(slides: SlideData[], analysis: AnalysisResult, options: ExportOptions): ExportResult {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${analysis.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #0891b2;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .slide {
            margin-bottom: 3rem;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        .slide-title {
            color: #0891b2;
            margin-bottom: 1rem;
        }
        .slide-content ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .slide-notes {
            margin-top: 1rem;
            padding: 1rem;
            background: #fff3cd;
            border-radius: 4px;
            font-style: italic;
        }
        .summary-section {
            background: #f0f9ff;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        .key-points, .insights {
            margin-bottom: 2rem;
        }
        .screenshot {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${analysis.title}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Slides:</strong> ${slides.length} | <strong>Confidence:</strong> ${Math.round(analysis.confidence * 100)}%</p>
    </div>

    <div class="summary-section">
        <h2>Summary</h2>
        <p>${analysis.summary}</p>
    </div>

    ${
      analysis.keyPoints.length > 0
        ? `
    <div class="key-points">
        <h2>Key Points</h2>
        <ul>
            ${analysis.keyPoints.map((point) => `<li>${point}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }

    ${
      analysis.insights.length > 0
        ? `
    <div class="insights">
        <h2>Insights</h2>
        <ul>
            ${analysis.insights.map((insight) => `<li>${insight}</li>`).join("")}
        </ul>
    </div>
    `
        : ""
    }

    <h2>Presentation Slides</h2>
    
    ${slides
      .map(
        (slide, index) => `
        <div class="slide">
            <h3 class="slide-title">Slide ${index + 1}: ${slide.title}</h3>
            <div class="slide-content">
                ${this.formatSlideContentForHTML(slide.content)}
            </div>
            ${options.includeScreenshots && slide.screenshot ? `<img src="${slide.screenshot}" alt="Screenshot" class="screenshot">` : ""}
            ${options.includeNotes && slide.notes ? `<div class="slide-notes"><strong>Speaker Notes:</strong> ${slide.notes}</div>` : ""}
        </div>
    `,
      )
      .join("")}

</body>
</html>
    `

    const blob = new Blob([html], { type: "text/html" })
    const downloadUrl = URL.createObjectURL(blob)
    const filename = `${this.sanitizeFilename(analysis.title)}_presentation.html`

    return {
      success: true,
      downloadUrl,
      filename,
    }
  }

  private static async exportAsPDF(
    slides: SlideData[],
    analysis: AnalysisResult,
    options: ExportOptions,
  ): Promise<ExportResult> {
    // In a real implementation, this would use a PDF generation library
    // For now, we'll simulate the process and return an HTML export
    console.log(" ExportService: PDF export not yet implemented, falling back to HTML")

    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time

    return this.exportAsHTML(slides, analysis, options)
  }

  private static async exportAsPowerPoint(
    slides: SlideData[],
    analysis: AnalysisResult,
    options: ExportOptions,
  ): Promise<ExportResult> {
    // In a real implementation, this would integrate with Google Slides API or use a PPTX library
    console.log(" ExportService: PowerPoint export requires Google Slides API integration")

    await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate processing time

    // Mock PowerPoint export
    const mockPptxData = {
      title: analysis.title,
      slides: slides.length,
      format: "pptx",
      message: "PowerPoint export would be handled by Google Slides API in production",
    }

    const jsonString = JSON.stringify(mockPptxData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const downloadUrl = URL.createObjectURL(blob)
    const filename = `${this.sanitizeFilename(analysis.title)}_slides.pptx.json`

    return {
      success: true,
      downloadUrl,
      filename,
    }
  }

  private static formatSlideContentForHTML(content: any): string {
    if (Array.isArray(content)) {
      return `<ul>${content.map((item) => `<li>${item}</li>`).join("")}</ul>`
    }

    if (typeof content === "object" && content !== null) {
      if (content.bullets) {
        return `<ul>${content.bullets.map((bullet: string) => `<li>${bullet}</li>`).join("")}</ul>`
      }
      if (content.summary) {
        return `<p>${content.summary}</p>`
      }
      if (content.keyPoints) {
        return `<ul>${content.keyPoints.map((point: string) => `<li>${point}</li>`).join("")}</ul>`
      }
      return `<pre>${JSON.stringify(content, null, 2)}</pre>`
    }

    if (typeof content === "string") {
      return `<p>${content}</p>`
    }

    return "<p>No content available</p>"
  }

  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase()
  }

  static async exportUserData(): Promise<ExportResult> {
    try {
      const data = {
        presentations: JSON.parse(localStorage.getItem("webslides_files") || "[]"),
        projects: JSON.parse(localStorage.getItem("webslides_projects") || "[]"),
        settings: JSON.parse(localStorage.getItem("webslides_settings") || "{}"),
        exportedAt: new Date().toISOString(),
      }

      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const downloadUrl = URL.createObjectURL(blob)
      const filename = `webslides_backup_${new Date().toISOString().split("T")[0]}.json`

      return {
        success: true,
        downloadUrl,
        filename,
      }
    } catch (error) {
      return {
        success: false,
        filename: "",
        error: "Failed to export user data",
      }
    }
  }
}
