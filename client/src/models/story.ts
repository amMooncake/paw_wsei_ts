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