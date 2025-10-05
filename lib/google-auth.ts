import { GoogleAuth } from "google-auth-library"

export interface GoogleCredentials {
  client_id: string
  client_secret: string
  redirect_uri: string
}

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  scope: string
  token_type: string
  expiry_date?: number
}

export class GoogleAuthService {
  private auth: GoogleAuth
  private credentials: GoogleCredentials

  constructor() {
    this.credentials = {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    }

    this.auth = new GoogleAuth({
      scopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/presentations",
      ],
      credentials: this.credentials,
    })
  }

  generateAuthUrl(): string {
    const { OAuth2Client } = require("google-auth-library")
    const oauth2Client = new OAuth2Client(
      this.credentials.client_id,
      this.credentials.client_secret,
      this.credentials.redirect_uri,
    )

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/presentations",
      ],
      prompt: "consent",
    })
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const { OAuth2Client } = require("google-auth-library")
    const oauth2Client = new OAuth2Client(
      this.credentials.client_id,
      this.credentials.client_secret,
      this.credentials.redirect_uri,
    )

    const { tokens } = await oauth2Client.getToken(code)
    return tokens as GoogleTokens
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const { OAuth2Client } = require("google-auth-library")
    const oauth2Client = new OAuth2Client(
      this.credentials.client_id,
      this.credentials.client_secret,
      this.credentials.redirect_uri,
    )

    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()
    return credentials as GoogleTokens
  }

  createAuthenticatedClient(tokens: GoogleTokens) {
    const { OAuth2Client } = require("google-auth-library")
    const oauth2Client = new OAuth2Client(
      this.credentials.client_id,
      this.credentials.client_secret,
      this.credentials.redirect_uri,
    )

    oauth2Client.setCredentials(tokens)
    return oauth2Client
  }
}
