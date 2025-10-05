import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  presentationCount: number
  lastModified: string
  status: "active" | "archived"
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span className="mr-2">👁️</span>
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">✏️</span>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">📤</span>
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">📁</span>
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>📊 {project.presentationCount} presentations</span>
          <span>📅 Modified {formatDate(project.lastModified)}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={project.status === "active" ? "default" : "secondary"}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <span className="mr-1">👁️</span>
              Open
            </Button>
            <Button size="sm">
              <span className="mr-1">➕</span>
              Add Content
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
