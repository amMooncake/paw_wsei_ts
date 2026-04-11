export type Story = {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
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
  priority: 'low',
  status: 'To Do',
  ownerId: '',
}