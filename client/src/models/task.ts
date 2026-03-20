import type { AssignableUser } from './user';

type TaskPriority = 'low' | 'medium' | 'high';

interface TaskBase {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  storyId: string;
  estimatedTime: number; // in hours
  workedHours: number;
  createdAt: Date;
}

export interface TodoTask extends TaskBase {
  status: 'todo';
  assignee?: AssignableUser;
  startedAt?: undefined;
  finishedAt?: undefined;
}

export interface DoingTask extends TaskBase {
  status: 'doing';
  assignee: AssignableUser;
  startedAt: Date;
  finishedAt?: undefined;
}

export interface DoneTask extends TaskBase {
  status: 'done';
  assignee: AssignableUser;
  startedAt: Date;
  finishedAt: Date;
}

export type Task = TodoTask | DoingTask | DoneTask;


export type TaskForm = {
    title: string;
    description: string;
    priority: TaskPriority;
    storyId: string;
    estimatedTime: number; // in hours
  };
  
  export const emptyTaskForm: TaskForm = {
      title: '',
      description: '',
      priority: 'low',
      storyId: '',
      estimatedTime: 1
  }
  
