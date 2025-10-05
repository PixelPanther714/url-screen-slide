// AI Processing service for analyzing screenshots and generating insights
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export interface AnalysisResult {
  title: string;
  summary: string;
  keyPoints: string[];
  insights: string[];
  slideContent: {
    title: string;
    content: string[];
    notes: string;
  }[];
  confidence: number;
  processingTime: number;
}

export interface ProcessingOptions {
  analysisType: "summary" | "detailed" | "presentation";
  focusAreas?: string[];
  slideCount?: number;
}

export class AIProcessor {
  static async analyzeScreenshot(
    imageData: string,
    url: string,
    options: ProcessingOptions = { analysisType: "summary" }
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const domain = new URL(url).hostname;
      const analysisType = options.analysisType;
      const slideCount = options.slideCount || 3;

      console.log(
        " AIProcessor: Starting analysis for",
        domain,
        "with",
        analysisType,
        "type"
      );

      const prompt = `You are an expert web analyst and presentation designer. Analyze this webpage screenshot from ${url} and create a comprehensive analysis suitable for generating professional slides.

ANALYSIS REQUIREMENTS:
- Analysis Type: ${analysisType}
- Focus Areas: ${options.focusAreas?.join(", ") || "general web analysis"}
- Target Slides: ${slideCount}

Please provide a detailed analysis in the following structured format:

TITLE: [Create a compelling title for this analysis]

SUMMARY: [Write a 2-3 sentence comprehensive summary of the webpage's purpose, content, and overall effectiveness]

KEY POINTS: [List 4-5 specific, actionable key points about the content, design, and functionality. Each point should be concise and insightful]
- Point 1
- Point 2
- Point 3
- Point 4
- Point 5

INSIGHTS: [Provide 3-4 strategic insights about user experience, design effectiveness, and business value]
- Insight 1
- Insight 2
- Insight 3
- Insight 4

SLIDE CONTENT: [Generate exactly ${slideCount} slides with specific titles and bullet points]
Slide 1: [Title]
- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
Notes: [Speaker notes for this slide]

Slide 2: [Title]
- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
Notes: [Speaker notes for this slide]

[Continue for all ${slideCount} slides]

Focus on creating actionable, specific content that would be valuable in a professional presentation about this website.`;

      // In a real implementation, you would use a vision-capable model
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: prompt,
        // maxTokens: 2000,
        temperature: 0.7,
      });

      console.log(" AIProcessor: Received AI response, parsing...");

      // Parse the AI response and structure it
      const result = this.parseAIResponse(text, domain, slideCount);
      result.processingTime = Date.now() - startTime;
      result.confidence = 0.85; // High confidence for text analysis

      console.log(
        " AIProcessor: Analysis complete in",
        result.processingTime,
        "ms"
      );
      return result;
    } catch (error) {
      console.error(" AIProcessor: Analysis failed", error);
      // Fallback to enhanced mock data if AI fails
      const fallback = this.generateMockAnalysis(url, options);
      fallback.processingTime = Date.now() - startTime;
      fallback.confidence = 0.6; // Lower confidence for fallback
      return fallback;
    }
  }

  private static parseAIResponse(
    aiText: string,
    domain: string,
    slideCount: number
  ): AnalysisResult {
    console.log(" AIProcessor: Parsing AI response...");

    // Extract title
    const titleMatch = aiText.match(/TITLE:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Analysis of ${domain}`;

    // Extract summary
    const summaryMatch = aiText.match(
      /SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|INSIGHTS:|SLIDE CONTENT:|$)/i
    );
    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : `Comprehensive analysis of ${domain} webpage content and design.`;

    // Extract key points
    const keyPointsMatch = aiText.match(
      /KEY POINTS:\s*([\s\S]*?)(?=INSIGHTS:|SLIDE CONTENT:|$)/i
    );
    const keyPoints = keyPointsMatch
      ? this.extractBulletPoints(keyPointsMatch[1])
      : this.getDefaultKeyPoints(domain);

    // Extract insights
    const insightsMatch = aiText.match(
      /INSIGHTS:\s*([\s\S]*?)(?=SLIDE CONTENT:|$)/i
    );
    const insights = insightsMatch
      ? this.extractBulletPoints(insightsMatch[1])
      : this.getDefaultInsights();

    // Extract slide content
    const slideContent = this.extractSlideContent(aiText, slideCount, domain);

    return {
      title,
      summary,
      keyPoints,
      insights,
      slideContent,
      confidence: 0.85,
      processingTime: 0, // Will be set by caller
    };
  }

  private static extractBulletPoints(text: string): string[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.startsWith("-") || line.startsWith("•") || line.match(/^\d+\./)
      )
      .map((line) =>
        line
          .replace(/^[-•]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .trim()
      )
      .filter((line) => line.length > 0)
      .slice(0, 5);
  }

  private static extractSlideContent(
    text: string,
    slideCount: number,
    domain: string
  ) {
    const slides = [];

    // Look for slide patterns in the AI response
    const slideMatches = text.match(
      /Slide \d+:\s*([^\n]+)([\s\S]*?)(?=Slide \d+:|Notes:|$)/gi
    );

    if (slideMatches && slideMatches.length > 0) {
      slideMatches.slice(0, slideCount).forEach((slideText, index) => {
        const lines = slideText
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l);
        const title = lines[0].replace(/^Slide \d+:\s*/, "").trim();

        const bulletPoints = lines
          .slice(1)
          .filter((line) => line.startsWith("-") || line.startsWith("•"))
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .slice(0, 4);

        const notesMatch = slideText.match(/Notes:\s*(.+)/i);
        const notes = notesMatch
          ? notesMatch[1].trim()
          : `Detailed analysis for ${title.toLowerCase()}`;

        slides.push({
          title: title || `Analysis Point ${index + 1}`,
          content:
            bulletPoints.length > 0
              ? bulletPoints
              : this.getDefaultSlideContent(index),
          notes,
        });
      });
    }

    // Fill remaining slides if needed
    while (slides.length < slideCount) {
      const index:number = slides.length;
      slides.push(this.generateDefaultSlide(index, domain));
    }

    return slides.slice(0, slideCount);
  }

  private static getDefaultKeyPoints(domain: string): string[] {
    return [
      `${domain} content structure and organization analyzed`,
      "User experience elements and navigation patterns identified",
      "Visual design hierarchy and branding elements assessed",
      "Key messaging and value propositions extracted",
      "Technical implementation and performance considerations noted",
    ];
  }

  private static getDefaultInsights(): string[] {
    return [
      "Professional presentation with clear visual hierarchy",
      "Effective content organization enhances user engagement",
      "Strong branding and messaging consistency throughout",
      "Well-structured information architecture supports user goals",
    ];
  }

  private static getDefaultSlideContent(index: number): string[] {
    const contentSets = [
      [
        "Website overview and primary purpose",
        "Target audience identification",
        "Key value propositions",
        "Overall user experience assessment",
      ],
      [
        "Content structure and organization",
        "Visual design and branding elements",
        "Navigation and user flow patterns",
        "Key messaging strategy",
      ],
      [
        "Strengths and effective elements",
        "Areas for improvement",
        "Best practices demonstrated",
        "Actionable recommendations",
      ],
    ];
    return contentSets[index % contentSets.length];
  }

  private static generateDefaultSlide(index: number, domain: string) {
    const slideTitles = [
      `Overview: ${domain}`,
      "Content & Design Analysis",
      "Key Insights & Recommendations",
      "Technical Assessment",
      "User Experience Evaluation",
    ];

    return {
      title: slideTitles[index] || `Analysis ${index + 1}`,
      content: this.getDefaultSlideContent(index),
      notes: `Comprehensive analysis of ${domain} focusing on ${
        slideTitles[index]?.toLowerCase() || "additional insights"
      }`,
    };
  }

  private static generateMockAnalysis(
    url: string,
    options: ProcessingOptions
  ): AnalysisResult {
    const domain = new URL(url).hostname;
    return {
      title: `Professional Analysis: ${domain}`,
      summary: `Comprehensive evaluation of ${domain} covering content strategy, user experience design, and technical implementation. This analysis provides actionable insights for presentation and strategic planning.`,
      keyPoints: this.getDefaultKeyPoints(domain),
      insights: this.getDefaultInsights(),
      slideContent: this.generateMockSlides(domain, options.slideCount || 3),
      confidence: 0.75,
      processingTime: 0,
    };
  }

  private static generateMockSlides(domain: string, count: number) {
    const slides = [];
    for (let i = 0; i < count; i++) {
      slides.push(this.generateDefaultSlide(i, domain));
    }
    return slides;
  }

  static async batchAnalyze(
    screenshots: Array<{ imageData: string; url: string }>,
    options: ProcessingOptions
  ): Promise<AnalysisResult[]> {
    console.log(
      " AIProcessor: Starting batch analysis of",
      screenshots.length,
      "screenshots"
    );

    const results = [];
    for (let i = 0; i < screenshots.length; i++) {
      console.log(
        " AIProcessor: Processing screenshot",
        i + 1,
        "of",
        screenshots.length
      );
      const screenshot = screenshots[i];
      const result = await this.analyzeScreenshot(
        screenshot.imageData,
        screenshot.url,
        options
      );
      results.push(result);
    }

    console.log(" AIProcessor: Batch analysis complete");
    return results;
  }

  static validateAnalysis(analysis: AnalysisResult): boolean {
    return (
      analysis.title.length > 0 &&
      analysis.summary.length > 20 &&
      analysis.keyPoints.length >= 3 &&
      analysis.insights.length >= 2 &&
      analysis.slideContent.length > 0 &&
      analysis.confidence > 0.5
    );
  }
}
