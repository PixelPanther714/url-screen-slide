import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CaptureSection } from "@/components/capture-section"
import { FeaturesSection } from "@/components/features-section"
import { WorkflowSection } from "@/components/workflow-section"

export default function HomePage() {
  console.log(" HomePage rendering") // Adding debug logging
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <CaptureSection />
        <FeaturesSection />
        <WorkflowSection />
      </main>
    </div>
  )
}
