"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GoogleLogin } from "@/components/auth/google-login"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const router = useRouter()
  const { isAuthenticated, tokens, logout, login, isLoading } = useGoogleAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleAuthSuccess = (newTokens: any) => {
    login(newTokens)
    setShowLoginDialog(false)
    // Redirect to dashboard after successful login
    router.push("/dashboard")
  }

  const handleAuthError = (error: string) => {
    console.error("Authentication failed:", error)
    // Could show a toast notification here
  }

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      setShowLoginDialog(true)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">WS</span>
            </div>
            <span className="font-bold text-xl">WebSlides</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#workflow" className="text-sm font-medium hover:text-primary transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </a>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-muted rounded"></div>
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <span className="text-xs">👤</span>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Google Account</p>
                    <p className="text-xs leading-none text-muted-foreground">Connected to Google Workspace</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <span className="mr-2">📊</span>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <span className="mr-2">📁</span>
                  My Presentations
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">⚙️</span>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <span className="mr-2">🚪</span>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Welcome to WebSlides</DialogTitle>
                    <DialogDescription>
                      Connect your Google account to save presentations and access Google Workspace features.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <GoogleLogin onSuccess={handleAuthSuccess} onError={handleAuthError} />
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="sm" onClick={handleDashboardClick}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
