import { google } from "googleapis"
import { GoogleAuthService, type GoogleTokens } from "./google-auth"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  createdTime: string
}

export interface SheetData {
  range: string
  values: string[][]
}

export interface SlideTemplate {
  id: string
  name: string
  thumbnailUrl?: string
}

export class GoogleAPIService {
  private authService: GoogleAuthService

  constructor() {
    this.authService = new GoogleAuthService()
  }

  // Drive API Methods
  async uploadFile(
    tokens: GoogleTokens,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    parentFolderId?: string,
  ): Promise<DriveFile> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const drive = google.drive({ version: "v3", auth })

    const fileMetadata: any = {
      name: fileName,
      parents: parentFolderId ? [parentFolderId] : undefined,
    }

    const media = {
      mimeType,
      body: fileBuffer,
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id,name,mimeType,webViewLink,createdTime",
    })

    return response.data as DriveFile
  }

  async createFolder(tokens: GoogleTokens, folderName: string, parentFolderId?: string): Promise<DriveFile> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const drive = google.drive({ version: "v3", auth })

    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : undefined,
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id,name,mimeType,webViewLink,createdTime",
    })

    return response.data as DriveFile
  }

  // Sheets API Methods
  async createSpreadsheet(
    tokens: GoogleTokens,
    title: string,
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
    })

    return {
      spreadsheetId: response.data.spreadsheetId!,
      spreadsheetUrl: response.data.spreadsheetUrl!,
    }
  }

  async writeToSheet(tokens: GoogleTokens, spreadsheetId: string, range: string, values: string[][]): Promise<void> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const sheets = google.sheets({ version: "v4", auth })

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    })
  }

  async readFromSheet(tokens: GoogleTokens, spreadsheetId: string, range: string): Promise<SheetData> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    return {
      range: response.data.range!,
      values: response.data.values || [],
    }
  }

  // Slides API Methods
  async createPresentation(
    tokens: GoogleTokens,
    title: string,
  ): Promise<{ presentationId: string; presentationUrl: string }> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const slides = google.slides({ version: "v1", auth })

    const response = await slides.presentations.create({
      requestBody: {
        title,
      },
    })

    return {
      presentationId: response.data.presentationId!,
      presentationUrl: `https://docs.google.com/presentation/d/${response.data.presentationId}/edit`,
    }
  }

  async addSlideWithImage(
    tokens: GoogleTokens,
    presentationId: string,
    imageUrl: string,
    title?: string,
    notes?: string,
  ): Promise<string> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const slides = google.slides({ version: "v1", auth })

    // Create a new slide
    const slideId = `slide_${Date.now()}`

    const requests = [
      {
        createSlide: {
          objectId: slideId,
          slideLayoutReference: {
            predefinedLayout: "TITLE_AND_BODY",
          },
        },
      },
    ]

    // Add title if provided
    if (title) {
      requests.push({
        insertText: {
          objectId: `${slideId}_title`,
          text: title,
        },
      } as any)
    }

    // Add image
    requests.push({
      createImage: {
        objectId: `${slideId}_image`,
        url: imageUrl,
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 300, unit: "PT" },
            width: { magnitude: 400, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 100,
            unit: "PT",
          },
        },
      },
    } as any)

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    })

    return slideId
  }

  async addTextToSlide(
    tokens: GoogleTokens,
    presentationId: string,
    slideId: string,
    text: string,
    x = 50,
    y = 50,
  ): Promise<void> {
    const auth = this.authService.createAuthenticatedClient(tokens)
    const slides = google.slides({ version: "v1", auth })

    const textBoxId = `textbox_${Date.now()}`

    const requests = [
      {
        createShape: {
          objectId: textBoxId,
          shapeType: "TEXT_BOX",
          elementProperties: {
            pageObjectId: slideId,
            size: {
              height: { magnitude: 100, unit: "PT" },
              width: { magnitude: 300, unit: "PT" },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: x,
              translateY: y,
              unit: "PT",
            },
          },
        },
      },
      {
        insertText: {
          objectId: textBoxId,
          text,
        },
      },
    ]

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    })
  }
}
