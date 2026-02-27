export interface Project {
  id: string
  name: string
  description: string
}

export type ProjectForm = Omit<Project, 'id'>


export const emptyForm: ProjectForm = {
  name: '',
  description: '',
}