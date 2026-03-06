export type Project = {
  id: string
  name: string
  description: string
  stories?: Story[]
}

export type ProjectForm = Omit<Project, 'id'>

export const emptyForm: ProjectForm = {
  name: '',
  description: '',
}

export type Story = {
    id: string // manually incrementing?
    title: string // user input
    description: string // user input
    priority: 'Low' | 'Medium' | 'High' // user choose
    projectId: string // to link story to a project
    creationDate: Date // auto-generated when story is created
    status: 'To Do' | 'In Progress' | 'Done' // everything is To Do first, waits for user to change it
    ownerId: string // to link story to a user
}