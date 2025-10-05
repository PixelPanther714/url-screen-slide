"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GoogleLoginProps {
  onSuccess?: (tokens: any) => void;
  onError?: (error: string) => void;
}

export function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      console.log(" GoogleLogin: Starting authentication flow");

      const response = await fetch("/api/google/auth");
      if (!response.ok) throw new Error("Failed to get authentication URL");

      const { authUrl: url } = await response.json();
      setAuthUrl(url);

      console.log(" GoogleLogin: Opening authentication window");
      const authWindow = window.open(
        url,
        "google-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!authWindow) throw new Error("Failed to open authentication window");

      // Listen for auth messages only
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
          console.log(" GoogleLogin: Authentication successful");
          authWindow.close();
          setIsLoading(false);
          onSuccess?.(event.data.tokens);
          window.removeEventListener("message", messageListener);
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          console.error(
            " GoogleLogin: Authentication failed",
            event.data.error
          );
          authWindow.close();
          setIsLoading(false);
          onError?.(event.data.error);
          window.removeEventListener("message", messageListener);
        }
      };

      window.addEventListener("message", messageListener);
    } catch (error) {
      console.error(" GoogleLogin: Login failed", error);
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <span>🔐</span>
          Google Authentication
        </CardTitle>
        <CardDescription>
          Sign in with Google to save and manage your presentations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">What you'll get:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="secondary" className="justify-center">
              <span className="mr-1">💾</span>
              Save Projects
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <span className="mr-1">📊</span>
              Google Slides
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <span className="mr-1">📈</span>
              Google Sheets
            </Badge>
            <Badge variant="secondary" className="justify-center">
              <span className="mr-1">☁️</span>
              Cloud Storage
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2 animate-spin">⏳</span>
              Connecting to Google...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span>
              Sign in with Google
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          We'll only access your Google Drive, Sheets, and Slides to save your
          presentations. Your data remains private and secure.
        </p>
      </CardContent>
    </Card>
  );
}
