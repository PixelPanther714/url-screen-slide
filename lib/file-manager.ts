export interface FileMetadata {
  id: string
  name: string
  type: "presentation" | "project" | "screenshot" | "analysis"
  size: number
  createdAt: string
  modifiedAt: string
  path: string
  tags: string[]
  googleDriveId?: string
}

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  description: string
  presentations: string[] // presentation IDs
  createdAt: string
  modifiedAt: string
  status: "active" | "archived"
}

export class FileManager {
  private static readonly STORAGE_KEY = "webslides_files"
  private static readonly PROJECTS_KEY = "webslides_projects"

  static saveFile(file: FileMetadata): void {
    const files = this.getAllFiles()
    const existingIndex = files.findIndex((f) => f.id === file.id)

    if (existingIndex >= 0) {
      files[existingIndex] = { ...file, modifiedAt: new Date().toISOString() }
    } else {
      files.push(file)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files))
    console.log(" FileManager: Saved file", file.name)
  }

  static getAllFiles(): FileMetadata[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error(" FileManager: Failed to load files", error)
      return []
    }
  }

  static getFilesByType(type: FileMetadata["type"]): FileMetadata[] {
    return this.getAllFiles().filter((file) => file.type === type)
  }

  static deleteFile(fileId: string): boolean {
    try {
      const files = this.getAllFiles()
      const filteredFiles = files.filter((file) => file.id !== fileId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFiles))
      console.log(" FileManager: Deleted file", fileId)
      return true
    } catch (error) {
      console.error(" FileManager: Failed to delete file", error)
      return false
    }
  }

  static searchFiles(query: string): FileMetadata[] {
    const files = this.getAllFiles()
    const lowercaseQuery = query.toLowerCase()

    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(lowercaseQuery) ||
        file.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    )
  }

  static saveProject(project: ProjectFile): void {
    const projects = this.getAllProjects()
    const existingIndex = projects.findIndex((p) => p.id === project.id)

    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, modifiedAt: new Date().toISOString() }
    } else {
      projects.push(project)
    }

    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects))
    console.log(" FileManager: Saved project", project.name)
  }

  static getAllProjects(): ProjectFile[] {
    try {
      const stored = localStorage.getItem(this.PROJECTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error(" FileManager: Failed to load projects", error)
      return []
    }
  }

  static deleteProject(projectId: string): boolean {
    try {
      const projects = this.getAllProjects()
      const filteredProjects = projects.filter((project) => project.id !== projectId)
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filteredProjects))
      console.log(" FileManager: Deleted project", projectId)
      return true
    } catch (error) {
      console.error(" FileManager: Failed to delete project", error)
      return false
    }
  }

  static getProjectPresentations(projectId: string): FileMetadata[] {
    const project = this.getAllProjects().find((p) => p.id === projectId)
    if (!project) return []

    const allFiles = this.getAllFiles()
    return allFiles.filter((file) => project.presentations.includes(file.id))
  }

  static addPresentationToProject(projectId: string, presentationId: string): boolean {
    try {
      const projects = this.getAllProjects()
      const project = projects.find((p) => p.id === projectId)

      if (!project) return false

      if (!project.presentations.includes(presentationId)) {
        project.presentations.push(presentationId)
        project.modifiedAt = new Date().toISOString()
        this.saveProject(project)
      }

      return true
    } catch (error) {
      console.error(" FileManager: Failed to add presentation to project", error)
      return false
    }
  }

  static getStorageStats() {
    const files = this.getAllFiles()
    const projects = this.getAllProjects()

    return {
      totalFiles: files.length,
      totalProjects: projects.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      filesByType: {
        presentations: files.filter((f) => f.type === "presentation").length,
        projects: projects.length,
        screenshots: files.filter((f) => f.type === "screenshot").length,
        analyses: files.filter((f) => f.type === "analysis").length,
      },
    }
  }

  static exportData() {
    return {
      files: this.getAllFiles(),
      projects: this.getAllProjects(),
      exportedAt: new Date().toISOString(),
    }
  }

  static importData(data: { files: FileMetadata[]; projects: ProjectFile[] }) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.files))
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(data.projects))
      console.log(" FileManager: Data imported successfully")
      return true
    } catch (error) {
      console.error(" FileManager: Failed to import data", error)
      return false
    }
  }
}
