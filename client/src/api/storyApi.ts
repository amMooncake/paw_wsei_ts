
import type { Story } from '../models/story'
import { storage, STORAGE_KEYS } from './storage'
import { CONFIG } from '../config'
import { db } from './db'

const STORY_STATUSES = ['To Do', 'In Progress', 'Done'] as const;

export const storyApi = {
  async getAll(): Promise<Story[]> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      const stories = await db.get<Story>('stories')
      return stories.map(story => ({
        ...story,
        creationDate: new Date(story.creationDate)
      }))
    }
    return storage.get<Story>(STORAGE_KEYS.STORIES).map(story => ({
      ...story,
      creationDate: new Date(story.creationDate)
    }))
  },

  async getByProjectId(projectId: string): Promise<Story[]> {
    const all = await this.getAll()
    return all.filter((s) => s.projectId === projectId)
  },

  saveAll(stories: Story[]): void {
    storage.set(STORAGE_KEYS.STORIES, stories)
  },

  async create(projectId: string, storyData: Omit<Story, 'id' | 'projectId' | 'creationDate'>): Promise<void> {
    const newStory = {
      id: crypto.randomUUID(),
      projectId,
      creationDate: new Date(),
      ...storyData,
    }
    
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.create('stories', newStory)
      return
    }

    const stories = await this.getAll()
    stories.push(newStory as Story)
    this.saveAll(stories)
  },

  async update(projectId: string, storyId: string, updatedData: Partial<Story>): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('stories', storyId, updatedData)
      return
    }
    const stories = await this.getAll()
    const index = stories.findIndex((s) => s.id === storyId && s.projectId === projectId)
    if (index !== -1) {
      stories[index] = { ...stories[index], ...updatedData }
      this.saveAll(stories)
    }
  },

  async delete(storyId: string): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      // cascade delete tasks
      const allTasks = await db.get<any>('tasks')
      const storyTasks = allTasks.filter(t => t.storyId === storyId)
      for (const t of storyTasks) {
        await db.delete('tasks', t.id)
      }
      await db.delete('stories', storyId)
      return
    }

    // Cascade delete
    const allTasks = storage.get<any>(STORAGE_KEYS.TASKS)
    const remainingTasks = allTasks.filter((t: any) => t.storyId !== storyId)
    storage.set(STORAGE_KEYS.TASKS, remainingTasks)

    const stories = await this.getAll()
    const remainingStories = stories.filter((s) => s.id !== storyId)
    this.saveAll(remainingStories)
  },

  async changeStatus(projectId: string, storyId: string, direction: 'up' | 'down'): Promise<void> {
    const stories = await this.getAll()
    const story = stories.find((s) => s.id === storyId && s.projectId === projectId)

    if (story) {
      const currentIndex = STORY_STATUSES.indexOf(story.status as any)
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (nextIndex >= 0 && nextIndex < STORY_STATUSES.length) {
        const newStatus = STORY_STATUSES[nextIndex] as any
        if (CONFIG.STORAGE_TYPE === 'database') {
          await db.update('stories', storyId, { status: newStatus })
        } else {
          story.status = newStatus
          this.saveAll(stories)
        }
      }
    }
  }
}
