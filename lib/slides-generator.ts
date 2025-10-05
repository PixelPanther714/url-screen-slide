import type { AnalysisResult } from "./ai-processor"

export interface SlideTemplate {
  layout: "title" | "content" | "image-content" | "bullet-points" | "two-column" | "image-focus"
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
}

export interface PresentationOptions {
  title: string
  template?: SlideTemplate
  includeScreenshots?: boolean
  customBranding?: {
    logo?: string
    colors?: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export interface SlideData {
  id: string
  type: string
  title: string
  content: any
  layout: string
  notes?: string
  screenshot?: string
}

export class SlidesGenerator {
  static async createPresentation(
    analyses: AnalysisResult[],
    screenshots: Array<{ imageData: string; url: string }>,
    options: PresentationOptions,
  ): Promise<string> {
    console.log(" SlidesGenerator: Creating presentation with", analyses.length, "analyses")

    const presentationData = {
      title: options.title,
      slides: this.generateSlidesData(analyses, screenshots, options),
      template: options.template || this.getDefaultTemplate(),
      branding: options.customBranding,
      metadata: {
        createdAt: new Date().toISOString(),
        totalSlides: 0,
        analysisCount: analyses.length,
      },
    }

    presentationData.metadata.totalSlides = presentationData.slides.length

    // Simulate API call delay for presentation creation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log(" SlidesGenerator: Presentation created with", presentationData.slides.length, "slides")

    // Mock presentation ID - in real implementation, this would come from Google Slides API
    return `presentation_${Date.now()}`
  }

  private static generateSlidesData(
    analyses: AnalysisResult[],
    screenshots: Array<{ imageData: string; url: string }>,
    options: PresentationOptions,
  ): SlideData[] {
    const slides: SlideData[] = []

    // Title slide
    slides.push({
      id: `slide_title_${Date.now()}`,
      type: "title",
      title: options.title,
      content: {
        subtitle: `Comprehensive Analysis of ${analyses.length} Website${analyses.length > 1 ? "s" : ""}`,
        date: new Date().toLocaleDateString(),
        author: "AI-Powered Web Analysis",
      },
      layout: "title",
    })

    // Executive Summary slide (if multiple analyses)
    if (analyses.length > 1) {
      slides.push({
        id: `slide_summary_${Date.now()}`,
        type: "executive-summary",
        title: "Executive Summary",
        content: {
          websites: analyses.map((analysis, index) => ({
            domain: screenshots[index] ? new URL(screenshots[index].url).hostname : `Website ${index + 1}`,
            title: analysis.title,
            confidence: analysis.confidence,
            keyInsight: analysis.insights[0] || "Professional web presence analyzed",
          })),
          totalInsights: analyses.reduce((sum, analysis) => sum + analysis.insights.length, 0),
          averageConfidence: analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / analyses.length,
        },
        layout: "two-column",
      })
    }

    // Individual website analysis
    analyses.forEach((analysis, index) => {
      const screenshot = screenshots[index]
      const domain = screenshot ? new URL(screenshot.url).hostname : `Website ${index + 1}`

      // Website overview slide
      slides.push({
        id: `slide_overview_${index}_${Date.now()}`,
        type: "website-overview",
        title: `${domain} - Overview`,
        content: {
          url: screenshot?.url,
          summary: analysis.summary,
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
          screenshot: options.includeScreenshots ? screenshot?.imageData : null,
        },
        layout: options.includeScreenshots ? "image-content" : "content",
        screenshot: screenshot?.imageData,
      })

      // Key findings slide
      slides.push({
        id: `slide_findings_${index}_${Date.now()}`,
        type: "key-findings",
        title: `${domain} - Key Findings`,
        content: {
          keyPoints: analysis.keyPoints,
          insights: analysis.insights.slice(0, 3), // Top 3 insights
          metrics: {
            totalPoints: analysis.keyPoints.length,
            totalInsights: analysis.insights.length,
            confidence: analysis.confidence,
          },
        },
        layout: "bullet-points",
      })

      // Generated slide content from AI
      analysis.slideContent.forEach((slideContent, slideIndex) => {
        slides.push({
          id: `slide_ai_${index}_${slideIndex}_${Date.now()}`,
          type: "ai-generated",
          title: slideContent.title,
          content: {
            bullets: slideContent.content,
            notes: slideContent.notes,
            source: domain,
          },
          layout: "bullet-points",
          notes: slideContent.notes,
        })
      })

      // Detailed insights slide
      if (analysis.insights.length > 3) {
        slides.push({
          id: `slide_insights_${index}_${Date.now()}`,
          type: "detailed-insights",
          title: `${domain} - Strategic Insights`,
          content: {
            insights: analysis.insights,
            recommendations: [
              "Leverage identified strengths in future projects",
              "Address areas for improvement systematically",
              "Apply best practices to similar initiatives",
              "Monitor performance metrics regularly",
            ],
          },
          layout: "two-column",
        })
      }
    })

    // Comparative analysis (if multiple websites)
    if (analyses.length > 1) {
      slides.push({
        id: `slide_comparison_${Date.now()}`,
        type: "comparison",
        title: "Comparative Analysis",
        content: {
          comparison: analyses.map((analysis, index) => ({
            domain: screenshots[index] ? new URL(screenshots[index].url).hostname : `Website ${index + 1}`,
            strengths: analysis.keyPoints.slice(0, 2),
            opportunities: analysis.insights.slice(0, 2),
            confidence: analysis.confidence,
          })),
          summary: "Cross-website patterns and opportunities identified",
        },
        layout: "two-column",
      })
    }

    // Action items and next steps
    slides.push({
      id: `slide_actions_${Date.now()}`,
      type: "action-items",
      title: "Action Items & Next Steps",
      content: {
        immediate: [
          "Review key findings with stakeholders",
          "Prioritize improvement opportunities",
          "Develop implementation timeline",
        ],
        shortTerm: [
          "Implement quick wins identified",
          "Begin planning major improvements",
          "Establish success metrics",
        ],
        longTerm: [
          "Execute comprehensive improvements",
          "Monitor and measure results",
          "Iterate based on performance data",
        ],
      },
      layout: "bullet-points",
    })

    return slides
  }

  private static getDefaultTemplate(): SlideTemplate {
    return {
      layout: "content",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      accentColor: "#0891b2",
      fontFamily: "Inter, system-ui, sans-serif",
    }
  }

  static getTemplateOptions(): Record<string, SlideTemplate> {
    return {
      professional: {
        layout: "content",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        accentColor: "#0891b2",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      modern: {
        layout: "content",
        backgroundColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#06b6d4",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      minimal: {
        layout: "content",
        backgroundColor: "#fafafa",
        textColor: "#262626",
        accentColor: "#525252",
        fontFamily: "system-ui, sans-serif",
      },
      corporate: {
        layout: "content",
        backgroundColor: "#ffffff",
        textColor: "#1e293b",
        accentColor: "#1d4ed8",
        fontFamily: "system-ui, sans-serif",
      },
    }
  }

  static async updatePresentation(
    presentationId: string,
    newAnalyses: AnalysisResult[],
    newScreenshots: Array<{ imageData: string; url: string }>,
  ): Promise<boolean> {
    console.log(" SlidesGenerator: Updating presentation", presentationId)
    // Mock update operation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log(" SlidesGenerator: Presentation updated successfully")
    return true
  }

  static generatePresentationPreview(
    analyses: AnalysisResult[],
    screenshots: Array<{ imageData: string; url: string }>,
    options: PresentationOptions,
  ) {
    const slides = this.generateSlidesData(analyses, screenshots, options)
    const estimatedDuration = Math.ceil(slides.length * 1.2) // 1.2 minutes per slide

    return {
      slideCount: slides.length,
      estimatedDuration: `${estimatedDuration} minutes`,
      structure: slides.map((slide) => ({
        id: slide.id,
        type: slide.type,
        title: slide.title,
        layout: slide.layout,
        contentPreview: this.generateContentPreview(slide.content),
        hasScreenshot: !!slide.screenshot,
      })),
      metadata: {
        analysisCount: analyses.length,
        totalKeyPoints: analyses.reduce((sum, analysis) => sum + analysis.keyPoints.length, 0),
        totalInsights: analyses.reduce((sum, analysis) => sum + analysis.insights.length, 0),
        averageConfidence: analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / analyses.length,
      },
    }
  }

  private static generateContentPreview(content: any): string {
    if (Array.isArray(content)) {
      return `${content.length} items`
    }
    if (typeof content === "object" && content !== null) {
      if (content.bullets) return `${content.bullets.length} bullet points`
      if (content.keyPoints) return `${content.keyPoints.length} key points`
      if (content.insights) return `${content.insights.length} insights`
      if (content.summary) return content.summary.substring(0, 50) + "..."
      return "Structured content"
    }
    if (typeof content === "string") {
      return content.substring(0, 50) + (content.length > 50 ? "..." : "")
    }
    return "Mixed content"
  }

  static exportSlideData(
    analyses: AnalysisResult[],
    screenshots: Array<{ imageData: string; url: string }>,
    options: PresentationOptions,
  ) {
    const slides = this.generateSlidesData(analyses, screenshots, options)
    return {
      presentation: {
        title: options.title,
        template: options.template || this.getDefaultTemplate(),
        createdAt: new Date().toISOString(),
      },
      slides,
      metadata: {
        slideCount: slides.length,
        analysisCount: analyses.length,
        hasScreenshots: options.includeScreenshots,
      },
    }
  }
}
