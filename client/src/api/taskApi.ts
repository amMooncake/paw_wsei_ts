
import type { Task, TaskForm, TodoTask, DoingTask, DoneTask } from '../models/task'
import type { AssignableUser } from '../models/user'
import { userApi } from './userApi'
import { storage, STORAGE_KEYS } from './storage'
import { storyApi } from './storyApi'
import { notificationApi } from './notificationApi'
import { CONFIG } from '../config'
import { db } from './db'

export const taskApi = {
  async getAll(): Promise<Task[]> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      const tasks = await db.get<Task>('tasks')
      return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        ...(task.startedAt && { startedAt: new Date(task.startedAt) }),
        ...(task.finishedAt && { finishedAt: new Date(task.finishedAt) }),
      }) as Task)
    }

    const tasks = storage.get<Task>(STORAGE_KEYS.TASKS)
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      ...(task.startedAt && { startedAt: new Date(task.startedAt) }),
      ...(task.finishedAt && { finishedAt: new Date(task.finishedAt) }),
    }) as Task)
  },

  async getByStoryId(storyId: string): Promise<Task[]> {
    const tasks = await this.getAll()
    return tasks.filter(t => t.storyId === storyId)
  },

  saveAll(tasks: Task[]): void {
    storage.set(STORAGE_KEYS.TASKS, tasks)
  },

  async create(storyId: string, taskData: TaskForm): Promise<void> {
    const newTask: TodoTask = {
      id: crypto.randomUUID(),
      ...taskData,
      storyId,
      status: 'todo',
      createdAt: new Date(),
      workedHours: 0,
    }

    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.create('tasks', newTask)
    } else {
      const tasks = await this.getAll()
      tasks.push(newTask)
      this.saveAll(tasks)
    }

    // Notify story owner
    const stories = await storyApi.getAll()
    const story = stories.find(s => s.id === storyId)
    if (story) {
      await notificationApi.send({
        title: 'Nowe Zadanie',
        message: `Nowe zadanie "${taskData.title}" w historyjce: ${story.title}`,
        priority: 'medium',
        recipientId: story.ownerId
      })
    }
  },

  async update(taskId: string, updatedData: Partial<Task>): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('tasks', taskId, updatedData)
      return
    }
    const tasks = await this.getAll()
    const updatedTasks = tasks.map(t => (t.id === taskId ? { ...t, ...updatedData } : t) as Task)
    this.saveAll(updatedTasks)
  },

  async delete(taskId: string): Promise<void> {
    const tasks = await this.getAll()
    const taskToDelete = tasks.find(t => t.id === taskId)
    
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.delete('tasks', taskId)
    } else {
      const filteredTasks = tasks.filter(t => t.id !== taskId)
      this.saveAll(filteredTasks)
    }

    if (taskToDelete) {
      const stories = await storyApi.getAll()
      const story = stories.find(s => s.id === taskToDelete.storyId)
      if (story) {
        await notificationApi.send({
          title: 'Zadanie Usunięte',
          message: `Zadanie "${taskToDelete.title}" zostało usunięte z historyjki: ${story.title}`,
          priority: 'medium',
          recipientId: story.ownerId
        })
      }
    }
  },

  async assignUser(taskId: string, userId: string): Promise<void> {
    const tasks = await this.getAll()
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

    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('tasks', taskId, { status: 'doing', assignee: user, startedAt: updatedTask.startedAt })
    } else {
      tasks[taskIndex] = updatedTask
      this.saveAll(tasks)
    }

    const stories = await storyApi.getAll()
    const story = stories.find(s => s.id === updatedTask.storyId)

    // Notify assigned user
    await notificationApi.send({
      title: 'Przypisano Zadanie',
      message: `Zostałeś przypisany do zadania: ${updatedTask.title}`,
      priority: 'high',
      recipientId: userId
    })

    // Notify story owner (status change to doing -> low priority)
    if (story) {
      await notificationApi.send({
        title: 'Zadanie Rozpoczęte',
        message: `Zadanie "${updatedTask.title}" w historyjce "${story.title}" zmieniło status na: Doing`,
        priority: 'low',
        recipientId: story.ownerId
      })

      if (story.status === 'To Do') {
        if (CONFIG.STORAGE_TYPE === 'database') {
          await db.update('stories', story.id, { status: 'In Progress' })
        } else {
          story.status = 'In Progress'
          await storyApi.saveAll(stories)
        }
      }
    }
  },

  async complete(taskId: string, workedHours: number): Promise<void> {
    const tasks = await this.getAll()
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

    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('tasks', taskId, { status: 'done', finishedAt: updatedTask.finishedAt, workedHours })
    } else {
      tasks[taskIndex] = updatedTask
      this.saveAll(tasks)
    }

    const storyId = updatedTask.storyId
    const stories = await storyApi.getAll()
    const story = stories.find(s => s.id === storyId)

    // Notify story owner (status change to done -> medium priority)
    if (story) {
      await notificationApi.send({
        title: 'Zadanie Zakończone',
        message: `Zadanie "${updatedTask.title}" w historyjce "${story.title}" zostało ukończone.`,
        priority: 'medium',
        recipientId: story.ownerId
      })
    }

    const storyTasks = tasks.filter(t => t.storyId === storyId)
    const allTasksDone = storyTasks.every(t => t.status === 'done')

    if (allTasksDone) {
      const stories2 = await storyApi.getAll()
      const currentStory = stories2.find(s => s.id === storyId)
      if (currentStory) {
        if (CONFIG.STORAGE_TYPE === 'database') {
          await db.update('stories', storyId, { status: 'Done' })
        } else {
          currentStory.status = 'Done'
          await storyApi.saveAll(stories2)
        }
      }
    }
  }
}
