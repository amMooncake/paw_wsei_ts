
import type { Task, TaskForm, TodoTask, DoingTask, DoneTask } from '../models/task'
import type { AssignableUser } from '../models/user'
import { userApi } from './userApi'
import { storage, STORAGE_KEYS } from './storage'
import { storyApi } from './storyApi'

export const taskApi = {
  getAll(): Task[] {
    const tasks = storage.get<Task>(STORAGE_KEYS.TASKS)
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      ...(task.startedAt && { startedAt: new Date(task.startedAt) }),
      ...(task.finishedAt && { finishedAt: new Date(task.finishedAt) }),
    }) as Task)
  },

  getByStoryId(storyId: string): Promise<Task[]> {
    const tasks = this.getAll()
    return Promise.resolve(tasks.filter(t => t.storyId === storyId))
  },

  saveAll(tasks: Task[]): void {
    storage.set(STORAGE_KEYS.TASKS, tasks)
  },

  create(storyId: string, taskData: TaskForm): Promise<void> {
    const tasks = this.getAll()
    const newTask: TodoTask = {
      id: crypto.randomUUID(),
      ...taskData,
      storyId,
      status: 'todo',
      createdAt: new Date(),
      workedHours: 0,
    }
    tasks.push(newTask)
    this.saveAll(tasks)
    return Promise.resolve()
  },

  update(taskId: string, updatedData: Partial<Task>): Promise<void> {
    const tasks = this.getAll()
    const updatedTasks = tasks.map(t => (t.id === taskId ? { ...t, ...updatedData } : t) as Task)
    this.saveAll(updatedTasks)
    return Promise.resolve()
  },

  delete(taskId: string): Promise<void> {
    const tasks = this.getAll().filter(t => t.id !== taskId)
    this.saveAll(tasks)
    return Promise.resolve()
  },

  async assignUser(taskId: string, userId: string): Promise<void> {
    const tasks = this.getAll()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = tasks[taskIndex]
    if (task.status !== 'todo') return

    const user = await userApi.getById(userId)
    if (!user || (user.role !== 'developer' && user.role !== 'devops')) return

    const updatedTask: DoingTask = {
      ...(task as TodoTask),
      status: 'doing',
      assignee: user as AssignableUser,
      startedAt: new Date(),
    }

    tasks[taskIndex] = updatedTask
    this.saveAll(tasks)

    const stories = storyApi.getAll()
    const story = stories.find(s => s.id === updatedTask.storyId)
    if (story && story.status === 'To Do') {
      story.status = 'In Progress'
      storyApi.saveAll(stories)
    }
  },

  async complete(taskId: string, workedHours: number): Promise<void> {
    const tasks = this.getAll()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = tasks[taskIndex]
    if (task.status !== 'doing') return

    const updatedTask: DoneTask = {
      ...(task as DoingTask),
      status: 'done',
      finishedAt: new Date(),
      workedHours,
    }

    tasks[taskIndex] = updatedTask
    this.saveAll(tasks)

    const storyId = updatedTask.storyId
    const storyTasks = tasks.filter(t => t.storyId === storyId)
    const allTasksDone = storyTasks.every(t => t.status === 'done')

    if (allTasksDone) {
      const stories = storyApi.getAll()
      const story = stories.find(s => s.id === storyId)
      if (story) {
        story.status = 'Done'
        storyApi.saveAll(stories)
      }
    }
  }
}
