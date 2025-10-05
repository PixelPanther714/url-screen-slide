"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, FileText, Presentation, BarChart3, Users } from "lucide-react"

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

interface SlideTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  slides: Slide[]
}

const templates: SlideTemplate[] = [
  {
    id: "title-slide",
    name: "Title Slide",
    description: "Perfect for presentation openings",
    icon: <FileText className="w-6 h-6" />,
    slides: [
      {
        id: "title-1",
        title: "Title Slide",
        background: "#fefce8",
        elements: [
          {
            id: "main-title",
            type: "text",
            content: "Your Presentation Title",
            x: 50,
            y: 150,
            width: 700,
            height: 100,
            fontSize: 56,
            fontWeight: "bold",
            color: "#ea580c",
          },
          {
            id: "subtitle",
            type: "text",
            content: "Subtitle or tagline goes here",
            x: 50,
            y: 280,
            width: 700,
            height: 60,
            fontSize: 28,
            color: "#4b5563",
          },
          {
            id: "author",
            type: "text",
            content: "Presented by Your Name",
            x: 50,
            y: 380,
            width: 400,
            height: 40,
            fontSize: 18,
            color: "#6b7280",
          },
        ],
      },
    ],
  },
  {
    id: "content-slide",
    name: "Content Slide",
    description: "Standard content layout with title and bullet points",
    icon: <Presentation className="w-6 h-6" />,
    slides: [
      {
        id: "content-1",
        title: "Content Slide",
        background: "#fefce8",
        elements: [
          {
            id: "slide-title",
            type: "text",
            content: "Slide Title",
            x: 50,
            y: 50,
            width: 700,
            height: 60,
            fontSize: 36,
            fontWeight: "bold",
            color: "#ea580c",
          },
          {
            id: "bullet-points",
            type: "text",
            content: "• First key point\n• Second important item\n• Third main concept\n• Fourth supporting detail",
            x: 50,
            y: 150,
            width: 600,
            height: 200,
            fontSize: 24,
            color: "#4b5563",
          },
        ],
      },
    ],
  },
  {
    id: "chart-slide",
    name: "Chart Slide",
    description: "Data visualization with chart and description",
    icon: <BarChart3 className="w-6 h-6" />,
    slides: [
      {
        id: "chart-1",
        title: "Chart Slide",
        background: "#fefce8",
        elements: [
          {
            id: "chart-title",
            type: "text",
            content: "Data Analysis",
            x: 50,
            y: 50,
            width: 700,
            height: 60,
            fontSize: 36,
            fontWeight: "bold",
            color: "#ea580c",
          },
          {
            id: "chart-element",
            type: "chart",
            content: "Chart Data",
            x: 50,
            y: 130,
            width: 400,
            height: 250,
          },
          {
            id: "chart-description",
            type: "text",
            content:
              "Key insights:\n• 25% increase in performance\n• Significant improvement\n• Positive trend continues",
            x: 480,
            y: 150,
            width: 270,
            height: 200,
            fontSize: 18,
            color: "#4b5563",
          },
        ],
      },
    ],
  },
  {
    id: "team-slide",
    name: "Team Slide",
    description: "Introduce your team members",
    icon: <Users className="w-6 h-6" />,
    slides: [
      {
        id: "team-1",
        title: "Meet Our Team",
        background: "#fefce8",
        elements: [
          {
            id: "team-title",
            type: "text",
            content: "Meet Our Team",
            x: 50,
            y: 50,
            width: 700,
            height: 60,
            fontSize: 36,
            fontWeight: "bold",
            color: "#ea580c",
          },
          {
            id: "team-member-1",
            type: "image",
            content: "/professional-headshot.png",
            x: 100,
            y: 150,
            width: 120,
            height: 120,
          },
          {
            id: "member-1-name",
            type: "text",
            content: "John Smith\nCEO & Founder",
            x: 80,
            y: 280,
            width: 160,
            height: 60,
            fontSize: 16,
            color: "#4b5563",
          },
          {
            id: "team-member-2",
            type: "image",
            content: "/professional-headshot.png",
            x: 340,
            y: 150,
            width: 120,
            height: 120,
          },
          {
            id: "member-2-name",
            type: "text",
            content: "Sarah Johnson\nCTO",
            x: 320,
            y: 280,
            width: 160,
            height: 60,
            fontSize: 16,
            color: "#4b5563",
          },
          {
            id: "team-member-3",
            type: "image",
            content: "/professional-headshot.png",
            x: 580,
            y: 150,
            width: 120,
            height: 120,
          },
          {
            id: "member-3-name",
            type: "text",
            content: "Mike Davis\nDesign Lead",
            x: 560,
            y: 280,
            width: 160,
            height: 60,
            fontSize: 16,
            color: "#4b5563",
          },
        ],
      },
    ],
  },
]

interface SlideTemplatesProps {
  onSelectTemplate: (template: SlideTemplate) => void
}

export function SlideTemplates({ onSelectTemplate }: SlideTemplatesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>Select a template to quickly create professional slides</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">{template.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="slide-thumbnail p-2 text-xs border rounded"
                      style={{ backgroundColor: slide.background }}
                    >
                      <div className="w-full h-16 relative overflow-hidden rounded">
                        {slide.elements.slice(0, 3).map((element) => (
                          <div
                            key={element.id}
                            className="absolute text-[6px] overflow-hidden"
                            style={{
                              left: `${(element.x / 800) * 100}%`,
                              top: `${(element.y / 450) * 100}%`,
                              width: `${(element.width / 800) * 100}%`,
                              height: `${(element.height / 450) * 100}%`,
                              fontSize: "6px",
                              color: element.color,
                            }}
                          >
                            {element.type === "text" && element.content.split("\n")[0]}
                            {element.type === "image" && <div className="bg-muted w-full h-full rounded-sm" />}
                            {element.type === "chart" && <BarChart3 className="w-2 h-2" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" onClick={() => onSelectTemplate(template)}>
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
