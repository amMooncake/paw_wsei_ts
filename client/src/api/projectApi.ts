import type { Project } from '../models/project'

const STORAGE_KEY = 'projects'

function readProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  return JSON.parse(raw) as Project[]
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const projectApi = {
  getAll(): Project[] {
    return readProjects()
  },

  create(data: Omit<Project, 'id'>): Project {
    const project: Project = {
      id: crypto.randomUUID(),
      ...data,
    }

    const projects = readProjects()
    projects.push(project)
    saveProjects(projects)

    return project
  },

  update(project: Project): Project {
    const projects = readProjects()
    const updated = projects.map((item) => (item.id === project.id ? project : item))
    saveProjects(updated)

    return project
  },

  delete(id: string): void {
    const projects = readProjects().filter((project) => project.id !== id)
    saveProjects(projects)
  },

  logAll(): void {
    console.table(readProjects())
  },

}
