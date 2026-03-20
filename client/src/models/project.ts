import type { Story } from './story'

export type Project = {
  id: string
  name: string
  description: string
  stories: Story[]
}

export type ProjectForm = Omit<Project, 'id'>

export const emptyForm: ProjectForm = {
  name: '',
  description: '',
  stories: [],
}




