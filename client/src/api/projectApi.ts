
import type { Project } from '../models/project'
import { storage, STORAGE_KEYS } from './storage'
import { storyApi } from './storyApi'
import { taskApi } from './taskApi'

export const projectApi = {
  async getAll(): Promise<Project[]> {
    return storage.get<Project>(STORAGE_KEYS.PROJECTS)
  },

  async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll()
    return projects.find((item) => item.id === id) ?? null
  },



  async create(data: Omit<Project, 'id'>): Promise<void> {
    const projectsData = storage.get<Project>(STORAGE_KEYS.PROJECTS)
    projectsData.push({
      id: crypto.randomUUID(),
      ...data,
    })
    storage.set(STORAGE_KEYS.PROJECTS, projectsData)
  },

  async update(project: Project): Promise<void> {
    const projectsData = storage.get<Project>(STORAGE_KEYS.PROJECTS)
    const index = projectsData.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projectsData[index] = project
      storage.set(STORAGE_KEYS.PROJECTS, projectsData)
    }
  },

  async delete(projectId: string): Promise<void> {
    // 1. Find all stories for this project to also delete their tasks
    const allStories = storyApi.getAll()
    const storyIdsToRemove = allStories
      .filter(s => s.projectId === projectId)
      .map(s => s.id)

    // 2. Cascade delete tasks
    const allTasks = storage.get<any>(STORAGE_KEYS.TASKS)
    const remainingTasks = allTasks.filter((t: any) => !storyIdsToRemove.includes(t.storyId))
    storage.set(STORAGE_KEYS.TASKS, remainingTasks)

    // 3. Cascade delete stories
    const remainingStories = allStories.filter(s => s.projectId !== projectId)
    storyApi.saveAll(remainingStories)

    // 4. Delete the project itself
    const projects = storage.get<any>(STORAGE_KEYS.PROJECTS).filter((p: any) => p.id !== projectId)
    storage.set(STORAGE_KEYS.PROJECTS, projects)
  },

  stories: storyApi,
  tasks: taskApi,

  logAll(): void {
    this.getAll().then(console.table)
  },
}
