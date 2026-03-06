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



export type Story = {
  id: string
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  projectId: string
  creationDate: Date
  status: 'To Do' | 'In Progress' | 'Done'
  ownerId: string
}
export type StoryForm = Omit<Story, 'id' | 'projectId' | 'creationDate'> & {
  title: string
  description: string
}


export const emptyStoryForm: StoryForm = {
  title: '',
  description: '',
  priority: 'Low',
  status: 'To Do',
  ownerId: '',
}
