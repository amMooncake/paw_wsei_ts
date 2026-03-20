import type { Story } from '../models/story'
import type { Project } from '../models/project'
import type { AssignableUser } from '../models/user'
import { userApi } from './userApi'
import type { Task, TaskForm, TodoTask, DoingTask, DoneTask } from '../models/task'

const STORAGE_KEY = 'projects'
const STORIES_KEY = 'stories'
const TASKS_KEY = 'tasks'

function readProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  const projects = JSON.parse(raw) as Omit<Project, 'stories'>[]
  const stories = readStories()

  return projects.map((p) => ({
    ...p,
    stories: stories.filter((s) => s.projectId === p.id),
  }))
}

function saveProjects(projects: Project[]): void {
  const allStories = projects.flatMap((p) => p.stories)
  saveStories(allStories)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allStories))
}

function readStories(): Story[] {
  const raw = localStorage.getItem(STORIES_KEY)
  if (!raw) {
    return []
  }

  // we need to deserialize dates from strings
  const stories = JSON.parse(raw) as Story[]
  return stories.map(story => ({
    ...story,
    creationDate: new Date(story.creationDate)
  }))
}

function saveStories(stories: Story[]): void {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
}

function readTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_KEY)
  if (!raw) {
    return []
  }

  const tasks = JSON.parse(raw) as Task[]
  return tasks.map(task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    ...(task.startedAt && { startedAt: new Date(task.startedAt) }),
    ...(task.finishedAt && { finishedAt: new Date(task.finishedAt) }),
  }))
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
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
      stories: []
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

    const stories = readStories()
    stories.push(newStory)
    saveStories(stories)

    return Promise.resolve()
  },
  getStories(projectId: string): Promise<Story[]> {
    const stories = readStories()
    return Promise.resolve(stories.filter((s) => s.projectId === projectId))
  },
  lowerStatusStory(projectId: string, storyId: string): Promise<void> {
    const stories = readStories()
    const story = stories.find((s) => s.id === storyId && s.projectId === projectId)
    if (story) {
      if (story.status === 'To Do') {
        story.status = 'In Progress'
      }
      else if (story.status === 'In Progress') {
        story.status = 'Done'
      }
    }
    saveStories(stories)
    return Promise.resolve()
  },
  higherStatusStory(projectId: string, storyId: string): Promise<void> {
    const stories = readStories()
    const story = stories.find((s) => s.id === storyId && s.projectId === projectId)
    if (story) {
      if (story.status === 'Done') {
        story.status = 'In Progress'
      }
      else if (story.status === 'In Progress') {
        story.status = 'To Do'
      }
    }
    saveStories(stories)
    return Promise.resolve()
  },
  removeStory(storyId: string): Promise<void> {
    const stories = readStories().filter((s) => s.id !== storyId)
    saveStories(stories)
    return Promise.resolve()
  },
  editStory(projectId: string, storyId: string, updatedData: Partial<Story>): Promise<void> {
    const stories = readStories()
    const storyIndex = stories.findIndex((s) => s.id === storyId && s.projectId === projectId)
    if (storyIndex !== -1) {
      stories[storyIndex] = { ...stories[storyIndex], ...updatedData }
    }
    saveStories(stories)
    return Promise.resolve()
  },

  // Task methods
  getTasks(storyId: string): Promise<Task[]> {
    const tasks = readTasks()
    return Promise.resolve(tasks.filter(t => t.storyId === storyId))
  },

  createTask(storyId: string, taskData: TaskForm): Promise<void> {
    const tasks = readTasks()
    const newTask: TodoTask = {
      id: crypto.randomUUID(),
      ...taskData,
      storyId,
      status: 'todo',
      createdAt: new Date(),
      workedHours: 0,
    }
    tasks.push(newTask)
    saveTasks(tasks)
    return Promise.resolve()
  },

  updateTask(taskId: string, updatedData: Partial<Task>): Promise<void> {
    const tasks = readTasks()
    const updatedTasks = tasks.map(t => (t.id === taskId ? { ...t, ...updatedData } : t))
    saveTasks(updatedTasks)
    return Promise.resolve()
  },

  deleteTask(taskId: string): Promise<void> {
    const tasks = readTasks()
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    saveTasks(updatedTasks)
    return Promise.resolve()
  },

  async assignUserToTask(taskId: string, userId: string): Promise<void> {
    const tasks = readTasks()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return Promise.resolve()
    }

    const task = tasks[taskIndex]
    if (task.status !== 'todo') {
      return Promise.resolve() // Or throw an error
    }

    const user = await userApi.getById(userId)
    if (!user || (user.role !== 'developer' && user.role !== 'devops')) {
      return Promise.resolve() // or throw
    }

    const updatedTask: DoingTask = {
      ...(task as TodoTask),
      status: 'doing',
      assignee: user as AssignableUser,
      startedAt: new Date(),
    }

    tasks[taskIndex] = updatedTask

    // Update story status if it was 'To Do'
    const stories = readStories()
    const story = stories.find(s => s.id === updatedTask.storyId)
    if (story && story.status === 'To Do') {
      story.status = 'In Progress'
      saveStories(stories)
    }

    saveTasks(tasks)
    return Promise.resolve()
  },

  completeTask(taskId: string, workedHours: number): Promise<void> {
    const tasks = readTasks()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return Promise.resolve()
    }

    const task = tasks[taskIndex]
    if (task.status !== 'doing') {
      return Promise.resolve()
    }

    const updatedTask: DoneTask = {
      ...(task as DoingTask),
      status: 'done',
      finishedAt: new Date(),
      workedHours,
    }

    tasks[taskIndex] = updatedTask

    // If all tasks for a story are done, update story status to 'Done'.
    const storyId = updatedTask.storyId
    const storyTasks = tasks.filter(t => t.storyId === storyId)
    const allTasksDone = storyTasks.every(t => t.status === 'done')

    if (allTasksDone) {
      const stories = readStories()
      const story = stories.find(s => s.id === storyId)
      if (story) {
        story.status = 'Done'
        saveStories(stories)
      }
    }

    saveTasks(tasks)
    return Promise.resolve()
  },

  logAll(): void {
    console.table(readProjects())
  },

}

