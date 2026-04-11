import { useEffect, useState } from 'react'
import { taskApi } from '../api/taskApi'
import { type Task, type TaskForm, emptyTaskForm } from '../models/task'
import { userApi } from '../api/userApi'
import type { AssignableUser } from '../models/user'
import Input from './ui/NeuInput'
import TextArea from './ui/NeuTextarea'
import NeuButton from './ui/NeuButtonBlue'
import { LuPencil, LuTrash2, LuCheck, LuX } from 'react-icons/lu'
import { tableStyles } from './ui/tableStyles'
import React from 'react'

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

    const priorityConfig = {
        low: 'niski',
        medium: 'średni',
        high: 'wysoki',
    }

    function renderTaskRow(task: Task) {
        const isEditing = editingTask?.id === task.id;

        if (isEditing) {
            return (
                <tr key={task.id} className={tableStyles.bodyRow}>
                    <td><Input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} /></td>
                    <td><Input value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} /></td>
                    <td>
                        <select
                            className="border-2 border-black px-2 py-1 bg-white"
                            value={editingTask.priority}
                            onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                        >
                            <option value="low">niski</option>
                            <option value="medium">średni</option>
                            <option value="high">wysoki</option>
                        </select>
                    </td>
                    <td><Input type="number" value={editingTask.estimatedTime} onChange={e => setEditingTask({ ...editingTask, estimatedTime: Number(e.target.value) })} /></td>
                    <td className={tableStyles.actionsCell}>
                        <div className="flex gap-2">
                            <NeuButton onClick={handleUpdateTask} className="!bg-green-400 p-1"><LuCheck /></NeuButton>
                            <NeuButton onClick={() => setEditingTask(null)} className="!bg-red-400 p-1"><LuX /></NeuButton>
                        </div>
                    </td>
                </tr>
            )
        }

        return (
            <tr key={task.id} className={tableStyles.bodyRow}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{priorityConfig[task.priority]}</td>
                <td>{task.estimatedTime}h</td>
                <td>
                    {task.status === 'todo' && (
                        <select className="border-2 border-black rounded px-1 py-1 bg-white text-xs" onChange={(e) => handleAssignUser(task.id, e.target.value)}>
                            <option value="">Przypisz...</option>
                            {assignableUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    )}
                    {task.status === 'doing' && (
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-blue-600 underline whitespace-nowrap">{task.assignee.name}</span>
                            <Input
                                type="number"
                                placeholder="h"
                                className="!w-12 !p-0.5 !text-center !text-xs"
                                value={workedHours[task.id] ?? ''}
                                onChange={e => setWorkedHours({ ...workedHours, [task.id]: Number(e.target.value) })}
                            />
                            <NeuButton onClick={() => handleCompleteTask(task.id)} className="!bg-emerald-400 !px-2 !py-0.5 !text-[10px] font-black uppercase">Ok</NeuButton>
                        </div>
                    )}
                    {task.status === 'done' && (
                        <span className="text-xs italic text-gray-500">{task.assignee.name} ({task.workedHours}h)</span>
                    )}
                </td>
                <td className={tableStyles.actionsCell}>
                    <div className={tableStyles.actionsContainer}>
                        <NeuButton onClick={() => setEditingTask(task)} className="!p-1 !bg-blue-300"><LuPencil /></NeuButton>
                        <NeuButton onClick={() => handleDeleteTask(task.id)} className="!p-1 !bg-rose-400"><LuTrash2 /></NeuButton>
                    </div>
                </td>
            </tr>
        )
    }

    const todoTasks = tasks.filter(t => t.status === 'todo')
    const doingTasks = tasks.filter(t => t.status === 'doing')
    const doneTasks = tasks.filter(t => t.status === 'done')

    return (
        <div className='flex flex-row w-full gap-10 mt-5'>
            {/* Sidebar Form */}
            <div className="flex flex-col gap-4 w-64 shrink-0">
                <h3 className="text-lg font-black uppercase underline-offset-4 decoration-4">Nowe Zadanie</h3>
                <form
                    className='flex flex-col gap-3'
                    onSubmit={async (event) => {
                        event.preventDefault()
                        await handleCreateTask()
                    }}
                >
                    <Input
                        type="text"
                        placeholder="Nazwa Zadania"
                        value={createForm.title}
                        onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                    />
                    <TextArea
                        placeholder="Opis Zadania"
                        className="!h-24"
                        value={createForm.description}
                        onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                    />
                    <select
                        className="border-2 border-black px-2 py-2 bg-white font-bold"
                        value={createForm.priority}
                        onChange={e => setCreateForm({ ...createForm, priority: e.target.value as any })}
                    >
                        <option value="low">niski</option>
                        <option value="medium">średni</option>
                        <option value="high">wysoki</option>
                    </select>
                    <Input
                        type="number"
                        placeholder="Estymacja (h)"
                        value={createForm.estimatedTime}
                        onChange={e => setCreateForm({ ...createForm, estimatedTime: Number(e.target.value) })}
                    />
                    <NeuButton type="submit" className="!bg-blue-600 font-black uppercase text-sm py-2">Dodaj</NeuButton>
                </form>
            </div>

            {/* Content Tables */}
            <div className="flex flex-col gap-10 grow overflow-hidden">
                <TaskTable title="DO ZROBIENIA" headerColor="bg-yellow-300">
                    {todoTasks.map(renderTaskRow)}
                </TaskTable>

                <TaskTable title="ROBIĘ" headerColor="bg-blue-300">
                    {doingTasks.map(renderTaskRow)}
                </TaskTable>

                <TaskTable title="ZROBIONE" headerColor="bg-green-300">
                    {doneTasks.map(renderTaskRow)}
                </TaskTable>
            </div>
        </div>
    )
}

function TaskTable({ title, headerColor, children }: { title: string, headerColor: string, children: React.ReactNode }) {
    const hasTasks = React.Children.count(children) > 0;

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-black uppercase">{title}</h2>
            <div className={tableStyles.wrapper}>
                <table className={tableStyles.table}>
                    <thead>
                        <tr className={`${tableStyles.headRow} ${headerColor}`}>
                            <th>Nazwa</th>
                            <th>Opis</th>
                            <th>Priorytet</th>
                            <th>Czas</th>
                            <th>Status/Akcja</th>
                            <th className={tableStyles.actionsHeaderCell}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hasTasks ? children : (
                            <tr><td colSpan={6} className="text-center p-4 italic text-gray-400">Brak zadań</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
