import { Button } from "@/components/ui/button"

export function Hero() {
  console.log(" Hero component rendering") // Adding debug logging
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border px-3 py-1 text-sm">
            <span className="mr-2 text-secondary">✨</span>
            AI-Powered Content Analysis
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Transform Web Content into
            <span className="text-primary"> Professional Slides</span>
          </h1>

          <p className="mb-8 text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Capture any webpage, let AI analyze the content, and automatically generate beautiful Google Slides
            presentations. Perfect for research, reports, and presentations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Capturing
              <span className="ml-2">→</span>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
