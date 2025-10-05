import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStatsProps {
  presentations: any[]
  projects: any[]
  isLoading: boolean
}

export function DashboardStats({ presentations, projects, isLoading }: DashboardStatsProps) {
  const totalSlides = presentations.reduce((sum, p) => sum + p.slideCount, 0)
  const completedPresentations = presentations.filter((p) => p.status === "completed").length
  const activeProjects = projects.filter((p) => p.status === "active").length

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Presentations</CardDescription>
          <CardTitle className="text-2xl">{presentations.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{completedPresentations} completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-2xl">{activeProjects}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{projects.length} total projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Slides</CardDescription>
          <CardTitle className="text-2xl">{totalSlides}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Across all presentations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>This Month</CardDescription>
          <CardTitle className="text-2xl">
            {
              presentations.filter((p) => {
                const created = new Date(p.createdAt)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">New presentations</p>
        </CardContent>
      </Card>
    </div>
  )
}
