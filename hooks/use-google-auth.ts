"use client"

import { useState, useEffect } from "react"
import type { GoogleTokens } from "@/lib/google-auth"

interface GoogleAuthState {
  isAuthenticated: boolean
  tokens: GoogleTokens | null
  user: {
    email?: string
    name?: string
    picture?: string
  } | null
  isLoading: boolean
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    tokens: null,
    user: null,
    isLoading: true,
  })

  useEffect(() => {
    // Check for stored tokens on mount
    const storedTokens = localStorage.getItem("google_tokens")
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens) as GoogleTokens

        // Check if tokens are still valid
        if (tokens.expiry_date && tokens.expiry_date > Date.now()) {
          setAuthState({
            isAuthenticated: true,
            tokens,
            user: null, // Will be fetched separately if needed
            isLoading: false,
          })
        } else {
          // Tokens expired, remove them
          localStorage.removeItem("google_tokens")
          setAuthState({
            isAuthenticated: false,
            tokens: null,
            user: null,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error(" useGoogleAuth: Invalid stored tokens", error)
        localStorage.removeItem("google_tokens")
        setAuthState({
          isAuthenticated: false,
          tokens: null,
          user: null,
          isLoading: false,
        })
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = (tokens: GoogleTokens) => {
    localStorage.setItem("google_tokens", JSON.stringify(tokens))
    setAuthState({
      isAuthenticated: true,
      tokens,
      user: null,
      isLoading: false,
    })
  }

  const logout = () => {
    localStorage.removeItem("google_tokens")
    setAuthState({
      isAuthenticated: false,
      tokens: null,
      user: null,
      isLoading: false,
    })
  }

  const refreshTokens = async () => {
    if (!authState.tokens?.refresh_token) {
      logout()
      return false
    }

    try {
      const response = await fetch("/api/google/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: authState.tokens.refresh_token,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh tokens")
      }

      const { tokens } = await response.json()
      login(tokens)
      return true
    } catch (error) {
      console.error(" useGoogleAuth: Token refresh failed", error)
      logout()
      return false
    }
  }

  return {
    ...authState,
    login,
    logout,
    refreshTokens,
  }
}
