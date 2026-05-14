
import type { Project } from '../models/project'
import { storage, STORAGE_KEYS } from './storage'
import { storyApi } from './storyApi'
import { taskApi } from './taskApi'
import { userApi } from './userApi'
import { notificationApi } from './notificationApi'
import { CONFIG } from '../config'
import { db } from './db'

export const projectApi = {
  async getAll(): Promise<Project[]> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      return db.get<Project>('projects')
    }
    return storage.get<Project>(STORAGE_KEYS.PROJECTS)
  },

  async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll()
    return projects.find((item) => item.id === id) ?? null
  },



  async create(data: Omit<Project, 'id'>): Promise<void> {
    const newId = crypto.randomUUID()
    const project = { id: newId, ...data }

    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.create('projects', project)
    } else {
      const projectsData = storage.get<Project>(STORAGE_KEYS.PROJECTS)
      projectsData.push(project)
      storage.set(STORAGE_KEYS.PROJECTS, projectsData)
    }

    // Notify all admins
    const users = await userApi.getAll()
    const admins = users.filter(u => u.role === 'admin')
    for (const admin of admins) {
      await notificationApi.send({
        title: 'Nowy Projekt',
        message: `Utworzono nowy projekt: ${data.name}`,
        priority: 'high',
        recipientId: admin.id
      })
    }
  },

  async update(project: Project): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('projects', project.id, project)
      return
    }
    const projectsData = storage.get<Project>(STORAGE_KEYS.PROJECTS)
    const index = projectsData.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projectsData[index] = project
      storage.set(STORAGE_KEYS.PROJECTS, projectsData)
    }
  },

  async delete(projectId: string): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      const allStories = await storyApi.getAll()
      const projectStories = allStories.filter(s => s.projectId === projectId)

      for (const story of projectStories) {
        await storyApi.delete(story.id)
      }

      await db.delete('projects', projectId)
      return
    }

    const allStories = await storyApi.getAll()
    const storyIdsToRemove = allStories
      .filter(s => s.projectId === projectId)
      .map(s => s.id)

    const allTasks = storage.get<any>(STORAGE_KEYS.TASKS)
    const remainingTasks = allTasks.filter((t: any) => !storyIdsToRemove.includes(t.storyId))
    storage.set(STORAGE_KEYS.TASKS, remainingTasks)

    const remainingStories = allStories.filter(s => s.projectId !== projectId)
    await storyApi.saveAll(remainingStories)

    const projects = storage.get<any>(STORAGE_KEYS.PROJECTS).filter((p: any) => p.id !== projectId)
    storage.set(STORAGE_KEYS.PROJECTS, projects)
  },

  stories: storyApi,
  tasks: taskApi,

  logAll(): void {
    this.getAll().then(console.table)
  },
}
