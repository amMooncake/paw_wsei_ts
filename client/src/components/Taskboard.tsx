import { useEffect, useState } from 'react'
import { taskApi } from '../api/taskApi'
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
            const loadedTasks = await taskApi.getByStoryId(storyId)
            setTasks(loadedTasks)
            const users = await userApi.getAssignableUsers()
            setAssignableUsers(users)
        }
        void loadData()
    }, [storyId])

    async function handleAssignUser(taskId: string, userId: string) {
        if (!userId) return
        await taskApi.assignUser(taskId, userId)
        const updatedTasks = await taskApi.getByStoryId(storyId)
        setTasks(updatedTasks)
    }

    async function handleCreateTask() {
        await taskApi.create(storyId, createForm)
        setCreateForm({ ...emptyTaskForm, storyId })
        const updatedTasks = await taskApi.getByStoryId(storyId)
        setTasks(updatedTasks)
    }

    async function handleCompleteTask(taskId: string) {
        const hours = workedHours[taskId] ?? 0
        await taskApi.complete(taskId, hours)
        const updatedTasks = await taskApi.getByStoryId(storyId)
        setTasks(updatedTasks)
    }

    async function handleDeleteTask(taskId: string) {
        await taskApi.delete(taskId)
        const updatedTasks = await taskApi.getByStoryId(storyId)
        setTasks(updatedTasks)
    }

    async function handleUpdateTask() {
        if (!editingTask) return
        await taskApi.update(editingTask.id, editingTask)
        setEditingTask(null)
        const updatedTasks = await taskApi.getByStoryId(storyId)
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
                <p>Priorytet: {task.priority === 'low' ? 'niski' : task.priority === 'medium' ? 'średni' : 'wysoki'}</p>
                <p>Szacowany czas: {task.estimatedTime}h</p>

                {task.status === 'todo' && (
                    <div>
                        Przypisz do:
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
                        <p>Przypisane do: {task.assignee.name}</p>
                        <p>Zaczęto: {task.startedAt.toLocaleDateString()}</p>
                        <div className='flex gap-2 items-center'>
                            <Input
                                type="number"
                                placeholder="Przepracowane godziny"
                                value={workedHours[task.id] ?? ''}
                                onChange={e => setWorkedHours({ ...workedHours, [task.id]: Number(e.target.value) })}
                            />
                            <NeuButton onClick={() => handleCompleteTask(task.id)}>Complete</NeuButton>
                        </div>
                    </>
                )}

                {task.status === 'done' && (
                    <>
                        <p>Przypisane do: {task.assignee.name}</p>
                        <p>Zakończono: {task.finishedAt.toLocaleDateString()}</p>
                        <p>Przepracowane godziny: {task.workedHours}h</p>
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
                <h3 className="text-lg font-bold">Edytuj zadanie</h3>
                <form className='flex flex-col gap-2 my-4' onSubmit={e => { e.preventDefault(); handleUpdateTask() }}>
                    <Input
                        type="text"
                        placeholder="Tytuł"
                        value={editingTask.title}
                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                    <TextArea
                        placeholder="Opis"
                        value={editingTask.description}
                        onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                    <select
                        className="border-2 border-black rounded px-2 py-1 bg-white"
                        value={editingTask.priority}
                        onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
                    >
                        <option value="low">Niski</option>
                        <option value="medium">Średni</option>
                        <option value="high">Wysoki</option>
                    </select>
                    <Input
                        type="number"
                        placeholder="Szacowany czas (h)"
                        value={editingTask.estimatedTime}
                        onChange={e => setEditingTask({ ...editingTask, estimatedTime: Number(e.target.value) })}
                    />
                    <div className='flex gap-2'>
                        <NeuButton type="submit">Zapisz</NeuButton>
                        <NeuButton onClick={() => setEditingTask(null)}>Anuluj</NeuButton>
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
                <h3 className="text-lg font-bold">Nowe zadanie</h3>
                <Input
                    type="text"
                    placeholder="Tytuł"
                    value={createForm.title}
                    onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                />
                <TextArea
                    placeholder="Opis"
                    value={createForm.description}
                    onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                />
                <select
                    className="border-2 border-black rounded px-2 py-1 bg-white"
                    value={createForm.priority}
                    onChange={e => setCreateForm({ ...createForm, priority: e.target.value as TaskForm['priority'] })}
                >
                    <option value="low">Niski</option>
                    <option value="medium">Średni</option>
                    <option value="high">Wysoki</option>
                </select>
                <Input
                    type="number"
                    placeholder="Estimated Time (h)"
                    value={createForm.estimatedTime}
                    onChange={e => setCreateForm({ ...createForm, estimatedTime: Number(e.target.value) })}
                />
                <NeuButton type="submit">Utwórz zadanie</NeuButton>
            </form>

            <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">Do zrobienia</h2>
                    {todoTasks.map(renderTaskCard)}
                </div>
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">W trakcie</h2>
                    {doingTasks.map(renderTaskCard)}
                </div>
                <div className="border-2 border-black p-4">
                    <h2 className="text-lg font-bold">Zrobione</h2>
                    {doneTasks.map(renderTaskCard)}
                </div>
            </div>
        </div>
    )
}
