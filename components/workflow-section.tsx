import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    step: "01",
    title: "Input URL",
    description: "Paste any webpage URL into our capture tool",
  },
  {
    step: "02",
    title: "Auto Capture",
    description: "AI automatically captures key visual elements and content",
  },
  {
    step: "03",
    title: "AI Analysis",
    description: "Advanced AI processes and analyzes the captured content",
  },
  {
    step: "04",
    title: "Generate Slides",
    description: "Professional Google Slides presentation is created automatically",
  },
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Simple 4-step process to transform any webpage into a presentation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center h-full">
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl font-bold text-primary mb-4">{step.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <span className="text-muted-foreground text-xl">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
