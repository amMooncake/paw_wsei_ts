
import type { Story } from '../models/story'
import { storage, STORAGE_KEYS } from './storage'

const STORY_STATUSES = ['To Do', 'In Progress', 'Done'] as const;

export const storyApi = {
  getAll(): Story[] {
    return storage.get<Story>(STORAGE_KEYS.STORIES).map(story => ({
      ...story,
      creationDate: new Date(story.creationDate)
    }))
  },

  getByProjectId(projectId: string): Promise<Story[]> {
    return Promise.resolve(this.getAll().filter((s) => s.projectId === projectId))
  },

  saveAll(stories: Story[]): void {
    storage.set(STORAGE_KEYS.STORIES, stories)
  },

  create(projectId: string, storyData: Omit<Story, 'id' | 'projectId' | 'creationDate'>): Promise<void> {
    const stories = this.getAll()
    stories.push({
      id: crypto.randomUUID(),
      projectId,
      creationDate: new Date(),
      ...storyData,
    })
    this.saveAll(stories)
    return Promise.resolve()
  },

  update(projectId: string, storyId: string, updatedData: Partial<Story>): Promise<void> {
    const stories = this.getAll()
    const index = stories.findIndex((s) => s.id === storyId && s.projectId === projectId)
    if (index !== -1) {
      stories[index] = { ...stories[index], ...updatedData }
      this.saveAll(stories)
    }
    return Promise.resolve()
  },

  delete(storyId: string): Promise<void> {
    // Cascade delete
    const allTasks = storage.get<any>(STORAGE_KEYS.TASKS)
    const remainingTasks = allTasks.filter((t: any) => t.storyId !== storyId)
    storage.set(STORAGE_KEYS.TASKS, remainingTasks)

    const stories = this.getAll().filter((s) => s.id !== storyId)
    this.saveAll(stories)
    return Promise.resolve()
  },

  changeStatus(projectId: string, storyId: string, direction: 'up' | 'down'): Promise<void> {
    const stories = this.getAll()
    const story = stories.find((s) => s.id === storyId && s.projectId === projectId)

    if (story) {
      const currentIndex = STORY_STATUSES.indexOf(story.status as any)
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (nextIndex >= 0 && nextIndex < STORY_STATUSES.length) {
        story.status = STORY_STATUSES[nextIndex] as any
        this.saveAll(stories)
      }
    }
    return Promise.resolve()
  }
}
