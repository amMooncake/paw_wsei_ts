
import type { Task, TaskForm, TodoTask, DoingTask, DoneTask } from '../models/task'
import type { AssignableUser } from '../models/user'
import { userApi } from './userApi'
import { storage, STORAGE_KEYS } from './storage'
import { storyApi } from './storyApi'
import { notificationApi } from './notificationApi'

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

  async create(storyId: string, taskData: TaskForm): Promise<void> {
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

    // Notify story owner
    const story = storyApi.getAll().find(s => s.id === storyId)
    if (story) {
      await notificationApi.send({
        title: 'Nowe Zadanie',
        message: `Nowe zadanie "${taskData.title}" w historyjce: ${story.title}`,
        priority: 'medium',
        recipientId: story.ownerId
      })
    }
  },

  update(taskId: string, updatedData: Partial<Task>): Promise<void> {
    const tasks = this.getAll()
    const updatedTasks = tasks.map(t => (t.id === taskId ? { ...t, ...updatedData } : t) as Task)
    this.saveAll(updatedTasks)
    return Promise.resolve()
  },

  async delete(taskId: string): Promise<void> {
    const tasks = this.getAll()
    const taskToDelete = tasks.find(t => t.id === taskId)
    const filteredTasks = tasks.filter(t => t.id !== taskId)
    this.saveAll(filteredTasks)

    if (taskToDelete) {
      const story = storyApi.getAll().find(s => s.id === taskToDelete.storyId)
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
        story.status = 'In Progress'
        storyApi.saveAll(stories)
      }
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
    const story = storyApi.getAll().find(s => s.id === storyId)

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
      const stories = storyApi.getAll()
      const currentStory = stories.find(s => s.id === storyId)
      if (currentStory) {
        currentStory.status = 'Done'
        storyApi.saveAll(stories)
      }
    }
  }
}
