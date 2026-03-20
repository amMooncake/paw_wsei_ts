import { useEffect, useState } from 'react'
import { projectApi } from '../api/projectApi'
import { type Task, type TaskForm, emptyTaskForm } from '../models/task'
import { userApi } from '../api/userApi'
import type { AssignableUser } from '../models/user'
import Input from './ui/NeuInput'
import TextArea from './ui/NeuTextarea'
import NeuButton from './ui/NeuButtonBlue'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

type TaskboardProps = {
    storyId: string
}

export default function Taskboard({ storyId }: TaskboardProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([])
    const [createForm, setCreateForm] = useState<TaskForm>({ ...emptyTaskForm, storyId })
    const [workedHours, setWorkedHours] = useState<Record<string, number>>({})
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    useEffect(() => {
        async function loadData() {
            const loadedTasks = await projectApi.getTasks(storyId)
            setTasks(loadedTasks)
            const users = await userApi.getAssignableUsers()
            setAssignableUsers(users)
        }
        void loadData()
    }, [storyId])

    async function handleAssignUser(taskId: string, userId: string) {
        if (!userId) return
        await projectApi.assignUserToTask(taskId, userId)
        const updatedTasks = await projectApi.getTasks(storyId)
        setTasks(updatedTasks)
    }

    async function handleCreateTask() {
        await projectApi.createTask(storyId, createForm)
        setCreateForm({ ...emptyTaskForm, storyId })
        const updatedTasks = await projectApi.getTasks(storyId)
        setTasks(updatedTasks)
    }

    async function handleCompleteTask(taskId: string) {
        const hours = workedHours[taskId] ?? 0
        await projectApi.completeTask(taskId, hours)
        const updatedTasks = await projectApi.getTasks(storyId)
        setTasks(updatedTasks)
    }

    async function handleDeleteTask(taskId: string) {
        await projectApi.deleteTask(taskId)
        const updatedTasks = await projectApi.getTasks(storyId)
        setTasks(updatedTasks)
    }

    async function handleUpdateTask() {
        if (!editingTask) return
        await projectApi.updateTask(editingTask.id, editingTask)
        setEditingTask(null)
        const updatedTasks = await projectApi.getTasks(storyId)
        setTasks(updatedTasks)
    }

    function renderTaskCard(task: Task) {
        return (
            <div key={task.id} className="border border-gray-400 p-2 my-2">
                <div className="flex justify-between">
                    <h3 className="font-bold">{task.title}</h3>
                    <div className="flex gap-2">
                        <NeuButton onClick={() => setEditingTask(task)} className="!p-1"><LuPencil /></NeuButton>
                        <NeuButton onClick={() => handleDeleteTask(task.id)} className="!p-1 !bg-red-400"><LuTrash2 /></NeuButton>
                    </div>
                </div>
                <p>{task.description}</p>
                <p>Priority: {task.priority}</p>
                <p>Estimated Time: {task.estimatedTime}h</p>

                {task.status === 'todo' && (
                     <div>
                        Assign to:
                        <select className="border-2 border-black rounded px-2 py-1 bg-white" onChange={(e) => handleAssignUser(task.id, e.target.value)}>
                            <option value="">Select user</option>
                            {assignableUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {task.status === 'doing' && (
                    <>
                        <p>Assignee: {task.assignee.name}</p>
                        <p>Started At: {task.startedAt.toLocaleDateString()}</p>
                        <div className='flex gap-2 items-center'>
                            <Input
                                type="number"
                                placeholder="Worked Hours"
                                value={workedHours[task.id] ?? ''}
                                onChange={e => setWorkedHours({ ...workedHours, [task.id]: Number(e.target.value) })}
                            />
                            <NeuButton onClick={() => handleCompleteTask(task.id)}>Complete</NeuButton>
                        </div>
                    </>
                )}

                {task.status === 'done' && (
                     <>
                        <p>Assignee: {task.assignee.name}</p>
                        <p>Finished At: {task.finishedAt.toLocaleDateString()}</p>
                        <p>Worked Hours: {task.workedHours}h</p>
                    </>
                )}
            </div>
        )
    }


    const todoTasks = tasks.filter(t => t.status === 'todo')
    const doingTasks = tasks.filter(t => t.status === 'doing')
    const doneTasks = tasks.filter(t => t.status === 'done')

    if (editingTask) {
        return (
            <div className="w-full">
                <h3 className="text-lg font-bold">Edit Task</h3>
                <form className='flex flex-col gap-2 my-4' onSubmit={e => { e.preventDefault(); handleUpdateTask()}}>
                <Input
                    type="text"
                    placeholder="Title"
                    value={editingTask.title}
                    onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                />
                <TextArea
                    placeholder="Description"
                    value={editingTask.description}
                    onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                />
                 <select
                    className="border-2 border-black rounded px-2 py-1 bg-white"
                    value={editingTask.priority}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <Input
                    type="number"
                    placeholder="Estimated Time (h)"
                    value={editingTask.estimatedTime}
                    onChange={e => setEditingTask({ ...editingTask, estimatedTime: Number(e.target.value) })}
                />
                <div className='flex gap-2'>
                    <NeuButton type="submit">Save</NeuButton>
                    <NeuButton onClick={() => setEditingTask(null)}>Cancel</NeuButton>
                </div>
                </form>
            </div>
        )
    }

    return (
        <div className='w-full'>
            <form
                className='flex flex-col gap-2 my-4'
                onSubmit={async (event) => {
                    event.preventDefault()
                    await handleCreateTask()
                }}
            >
                <h3 className="text-lg font-bold">Create New Task</h3>
                <Input
                    type="text"
                    placeholder="Title"
                    value={createForm.title}
                    onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                />
                <TextArea
                    placeholder="Description"
                    value={createForm.description}
                    onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                />
                <select
                    className="border-2 border-black rounded px-2 py-1 bg-white"
                    value={createForm.priority}
                    onChange={e => setCreateForm({ ...createForm, priority: e.target.value as TaskForm['priority'] })}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <Input
                    type="number"
                    placeholder="Estimated Time (h)"
                    value={createForm.estimatedTime}
                    onChange={e => setCreateForm({ ...createForm, estimatedTime: Number(e.target.value) })}
                />
                <NeuButton type="submit">Create Task</NeuButton>
            </form>

            <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">Todo</h2>
                    {todoTasks.map(renderTaskCard)}
                </div>
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">Doing</h2>
                    {doingTasks.map(renderTaskCard)}
                </div>
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">Done</h2>
                    {doneTasks.map(renderTaskCard)}
                </div>
            </div>
        </div>
    )
}
