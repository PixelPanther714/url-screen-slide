import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: "📷",
    title: "Smart Screenshot Capture",
    description: "Automatically captures key visual elements from any webpage using advanced DOM analysis.",
  },
  {
    icon: "🧠",
    title: "AI Content Analysis",
    description: "Powered by advanced AI models to extract insights, summaries, and key points from captured content.",
  },
  {
    icon: "📊",
    title: "Auto Slide Generation",
    description: "Creates professional Google Slides presentations with your content and AI-generated insights.",
  },
  {
    icon: "⚡",
    title: "One-Click Workflow",
    description: "Complete automation from URL input to finished presentation in just a few clicks.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your data is processed securely with enterprise-grade privacy and security measures.",
  },
  {
    icon: "🌐",
    title: "Works Everywhere",
    description: "Browser-based solution that works on any device without requiring installations.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform web content into professional presentations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
