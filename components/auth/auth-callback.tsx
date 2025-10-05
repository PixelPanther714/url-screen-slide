"use client"

import { useEffect } from "react"

export function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const error = urlParams.get("error")

      if (error) {
        console.error(" AuthCallback: OAuth error", error)
        window.opener?.postMessage({ type: "GOOGLE_AUTH_ERROR", error }, window.location.origin)
        window.close()
        return
      }

      if (code) {
        try {
          console.log(" AuthCallback: Exchanging code for tokens")

          const response = await fetch("/api/google/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          })

          if (!response.ok) {
            throw new Error("Failed to exchange code for tokens")
          }

          const { tokens } = await response.json()

          console.log(" AuthCallback: Tokens received successfully")

          // Store tokens in localStorage
          localStorage.setItem("google_tokens", JSON.stringify(tokens))

          // Notify parent window
          window.opener?.postMessage({ type: "GOOGLE_AUTH_SUCCESS", tokens }, window.location.origin)

          window.close()
        } catch (error) {
          console.error(" AuthCallback: Token exchange failed", error)
          window.opener?.postMessage(
            { type: "GOOGLE_AUTH_ERROR", error: error instanceof Error ? error.message : "Unknown error" },
            window.location.origin,
          )
          window.close()
        }
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin text-4xl">⏳</div>
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  )
}
