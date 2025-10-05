import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Presentation {
  id: string
  title: string
  createdAt: string
  slideCount: number
  status: "draft" | "completed" | "processing"
  thumbnail?: string
  url?: string
}

interface PresentationCardProps {
  presentation: Presentation
}

export function PresentationCard({ presentation }: PresentationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{presentation.title}</CardTitle>
            <CardDescription className="text-sm">
              {presentation.url && new URL(presentation.url).hostname}
            </CardDescription>
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
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🗑️</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>📊 {presentation.slideCount} slides</span>
          <span>📅 {formatDate(presentation.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(presentation.status)} variant="secondary">
            {presentation.status === "processing" && <span className="mr-1 animate-spin">⏳</span>}
            {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
          </Badge>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <span className="mr-1">👁️</span>
              View
            </Button>
            <Button size="sm">
              <span className="mr-1">📤</span>
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
