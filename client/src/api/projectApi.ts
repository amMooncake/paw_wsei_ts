
import type { Project, Story } from '../models/project'

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
  getAll(): Promise<Project[]> {
    return Promise.resolve(readProjects())
  },
  getById(id: string): Promise<Project | null> {
    const project = readProjects().find((item) => item.id === id)
    return Promise.resolve(project ?? null)
  },
  create(data: Omit<Project, 'id'>): Promise<void> {
    const project: Project = {
      id: crypto.randomUUID(),
      ...data,
    }

    const projects = readProjects()
    projects.push(project)
    saveProjects(projects)

    return Promise.resolve()
  },
  update(project: Project): Promise<void> {
    const projects = readProjects()
    const updated = projects.map((item) => (item.id === project.id ? project : item))
    saveProjects(updated)

    return Promise.resolve()
  },
  delete(id: string): Promise<void> {
    const projects = readProjects().filter((project) => project.id !== id)
    saveProjects(projects)
    return Promise.resolve()
  },
  createStory(projectId: string, storyData: Omit<Story, 'id' | 'projectId' | 'creationDate'>): Promise<void> {

    const newStory: Story = {
      id: crypto.randomUUID(),
      projectId,
      creationDate: new Date(),
      ...storyData,
    }

    const projects = readProjects()

    const project = projects.find((p) => p.id === projectId)
    if (project) {
      project.stories.push(newStory)
    }
    saveProjects(projects)

    return Promise.resolve()
  },
  getStories(projectId: string): Promise<Story[]> {
    const projects = readProjects()
    const project = projects.find((p) => p.id === projectId)
    return Promise.resolve(project ? project.stories : [])
  },
  
  lowerStatusStory(projectId: string, storyId: string): Promise<void> {
    const projects = readProjects()
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const story = project.stories.find((s) => s.id === storyId)
      if (story) {
        if (story.status === 'To Do') {
          story.status = 'In Progress'
        } else if (story.status === 'In Progress') {
          story.status = 'Done'
        }
      }
    }
    saveProjects(projects)
    return Promise.resolve()
  },

  higherStatusStory(projectId: string, storyId: string): Promise<void> {
    const projects = readProjects()
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const story = project.stories.find((s) => s.id === storyId)
      if (story) {
        if (story.status === 'Done') {
          story.status = 'In Progress'
        } else if (story.status === 'In Progress') {
          story.status = 'To Do'
        }
      }
    }
    saveProjects(projects)
    return Promise.resolve()
  },


  logAll(): void {
    console.table(readProjects())
  },

}

