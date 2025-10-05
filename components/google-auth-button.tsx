"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import type { GoogleTokens } from "@/lib/google-auth"

interface GoogleAuthButtonProps {
  onAuthSuccess: (tokens: GoogleTokens) => void
  isAuthenticated: boolean
}

export function GoogleAuthButton({ onAuthSuccess, isAuthenticated }: GoogleAuthButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true)

    try {
      // Get auth URL
      const authResponse = await fetch("/api/google/auth")
      const { authUrl } = await authResponse.json()

      // Open popup for OAuth
      const popup = window.open(authUrl, "google-auth", "width=500,height=600,scrollbars=yes,resizable=yes")

      // Listen for popup messages
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
          const { code } = event.data

          // Exchange code for tokens
          const tokenResponse = await fetch("/api/google/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          })

          const { tokens } = await tokenResponse.json()
          onAuthSuccess(tokens)
          popup?.close()
        }
      }

      window.addEventListener("message", handleMessage)

      // Clean up listener when popup closes
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          setIsAuthenticating(false)
        }
      }, 1000)
    } catch (error) {
      console.error("Authentication error:", error)
      setIsAuthenticating(false)
    }
  }

  if (isAuthenticated) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Google Account Connected
          </CardTitle>
          <CardDescription>Ready to create presentations and manage files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="secondary">Drive Access</Badge>
            <Badge variant="secondary">Sheets Access</Badge>
            <Badge variant="secondary">Slides Access</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Google Account</CardTitle>
        <CardDescription>Authorize access to Google Drive, Sheets, and Slides to create presentations</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleAuth} disabled={isAuthenticating} className="w-full">
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Google Account
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
