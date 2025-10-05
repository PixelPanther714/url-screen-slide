"use client"

import { useEffect, useState } from "react"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleLogin } from "@/components/auth/google-login"
import { PresentationCard } from "@/components/dashboard/presentation-card"
import { ProjectCard } from "@/components/dashboard/project-card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"

interface Presentation {
  id: string
  title: string
  createdAt: string
  slideCount: number
  status: "draft" | "completed" | "processing"
  thumbnail?: string
  url?: string
}

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  presentationCount: number
  lastModified: string
  status: "active" | "archived"
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, login } = useGoogleAuth()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData()
    }
  }, [isAuthenticated])

  const loadUserData = async () => {
    setIsLoadingData(true)
    try {
      // Simulate loading user presentations and projects
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data - in real app, this would come from API
      setPresentations([
        {
          id: "pres_1",
          title: "Nike Homepage Analysis",
          createdAt: "2024-01-15T10:30:00Z",
          slideCount: 12,
          status: "completed",
          url: "https://nike.com",
        },
        {
          id: "pres_2",
          title: "Stripe Pricing Page Review",
          createdAt: "2024-01-14T15:45:00Z",
          slideCount: 8,
          status: "completed",
          url: "https://stripe.com/pricing",
        },
        {
          id: "pres_3",
          title: "Airbnb UX Analysis",
          createdAt: "2024-01-13T09:20:00Z",
          slideCount: 15,
          status: "processing",
          url: "https://airbnb.com",
        },
      ])

      setProjects([
        {
          id: "proj_1",
          name: "E-commerce Research",
          description: "Analyzing top e-commerce websites for UX patterns",
          createdAt: "2024-01-10T08:00:00Z",
          presentationCount: 5,
          lastModified: "2024-01-15T10:30:00Z",
          status: "active",
        },
        {
          id: "proj_2",
          name: "SaaS Landing Pages",
          description: "Competitive analysis of SaaS landing page designs",
          createdAt: "2024-01-05T14:30:00Z",
          presentationCount: 3,
          lastModified: "2024-01-14T15:45:00Z",
          status: "active",
        },
      ])
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleAuthSuccess = (tokens: any) => {
    login(tokens)
  }

  const filteredPresentations = presentations.filter((presentation) =>
    presentation.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⏳</div>
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">Sign in with Google to access your presentations and projects</p>
          </div>
          <GoogleLogin onSuccess={handleAuthSuccess} onError={(error) => console.error(error)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your presentations and projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search presentations and projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80"
              />
              <Button>
                <span className="mr-2">➕</span>
                New Project
              </Button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats presentations={presentations} projects={projects} isLoading={isLoadingData} />

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Tabs defaultValue="presentations" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="presentations">Presentations ({filteredPresentations.length})</TabsTrigger>
                  <TabsTrigger value="projects">Projects ({filteredProjects.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="presentations" className="space-y-4">
                  {isLoadingData ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                              <div className="h-3 bg-muted rounded w-2/3"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredPresentations.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredPresentations.map((presentation) => (
                        <PresentationCard key={presentation.id} presentation={presentation} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="space-y-4">
                          <div className="text-4xl">📊</div>
                          <h3 className="text-lg font-semibold">No presentations yet</h3>
                          <p className="text-muted-foreground">
                            Start by capturing a webpage to create your first presentation
                          </p>
                          <Button>
                            <span className="mr-2">🚀</span>
                            Create Presentation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="h-4 bg-muted rounded w-1/2"></div>
                              <div className="h-3 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/3"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredProjects.length > 0 ? (
                    <div className="space-y-4">
                      {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="space-y-4">
                          <div className="text-4xl">📁</div>
                          <h3 className="text-lg font-semibold">No projects yet</h3>
                          <p className="text-muted-foreground">Create a project to organize your presentations</p>
                          <Button>
                            <span className="mr-2">➕</span>
                            New Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RecentActivity presentations={presentations} isLoading={isLoadingData} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="mr-2">🌐</span>
                    Capture New Website
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="mr-2">📊</span>
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="mr-2">⚙️</span>
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
