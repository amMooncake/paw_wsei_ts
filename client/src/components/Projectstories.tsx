import { useEffect, useState } from 'react'

import { storyApi } from '../api/storyApi'
import { type Project } from '../models/project'
import { emptyStoryForm, type StoryForm, type Story } from '../models/story'
import { tableStyles } from './ui/tableStyles'
import Taskboard from './Taskboard'

import { LuPencil, LuCheck, LuX, LuArrowDown, LuArrowUp, LuTrash2, LuListTodo } from "react-icons/lu";


import NeuButton from './ui/NeuButtonBlue'
import Input from './ui/NeuInput';
import TextArea from './ui/NeuTextarea';


type ProjectStoriesProps = {
    project: Project
    onBack: () => void
    userId: string
}

const heading2Style = "text-1xl font-black uppercase tracking-wide dark:text-white" as const

export default function ProjectStories({ project, onBack, userId }: ProjectStoriesProps) {
    const [createForm, setCreateForm] = useState<StoryForm>({ ...emptyStoryForm, ownerId: userId })
    const [stories, setStories] = useState<Story[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Pick<Story, 'title' | 'description' | 'priority'>>({
        title: '',
        description: '',
        priority: 'low',
    })
    const projectId = project.id


    useEffect(() => {
        async function loadStories() {
            const loadedStories = await storyApi.getByProjectId(projectId)
            setStories(loadedStories)
        }
        void loadStories()

    }, [projectId])

    async function handleSubmit() {
        await storyApi.create(projectId, createForm)
        setCreateForm({ ...emptyStoryForm, ownerId: userId })
        const updatedStories = await storyApi.getByProjectId(projectId)
        setStories(updatedStories)
    }

    async function handleLowerStatus(storyId: string) {
        await storyApi.changeStatus(projectId, storyId, 'down')
        const updatedStories = await storyApi.getByProjectId(projectId)
        setStories(updatedStories)
    }

    async function handleHigherStatus(storyId: string) {
        await storyApi.changeStatus(projectId, storyId, 'up')
        const updatedStories = await storyApi.getByProjectId(projectId)
        setStories(updatedStories)
    }


    async function handleDeleteStory(storyId: string) {
        await storyApi.delete(storyId)
        if (editingId === storyId) {
            setEditingId(null)
            setEditForm({ title: '', description: '', priority: 'low' })
        }
        const updatedStories = await storyApi.getByProjectId(projectId)
        setStories(updatedStories)
    }

    function startEdit(story: Story) {
        setEditingId(story.id)
        setEditForm({
            title: story.title,
            description: story.description,
            priority: story.priority,
        })
    }

    function handleCancelEdit() {
        setEditingId(null)
        setEditForm({ title: '', description: '', priority: 'low' })
    }

    async function handleSaveEdit() {
        if (!editingId) {
            return
        }

        await storyApi.update(projectId, editingId, editForm)
        const updatedStories = await storyApi.getByProjectId(projectId)
        setStories(updatedStories)
        handleCancelEdit()
    }

    function handleShowTasks(storyId: string) {
        setSelectedStoryId(storyId)
    }

    if (selectedStoryId) {
        return (
            <div className="notebook-grid min-h-screen w-full flex justify-center px-10 pt-20">
                <section className="w-full max-w-5xl flex flex-col items-center gap-5">
                    <NeuButton onClick={() => setSelectedStoryId(null)}>Wróć do historii</NeuButton>
                    <Taskboard storyId={selectedStoryId} />
                </section>
            </div>
        )
    }

    function renderStoryRow(story: Story) {
        const isEditing = editingId === story.id

        return (
            <tr className={tableStyles.bodyRow} key={story.id}>
                <td>
                    {isEditing ? (
                        <Input
                            type="text"
                            value={editForm.title}
                            placeholder="Nazwa"
                            onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                        />
                    ) : (
                        story.title
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <Input
                            value={editForm.description}
                            placeholder="Opis"
                            onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                        />
                    ) : (
                        story.description
                    )}
                </td>
                <td>{new Date(story.creationDate).toLocaleString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })}</td>
                <td>
                    {isEditing ? (
                        <select
                            className="border-2 border-black rounded px-2 py-1 bg-white"
                            value={editForm.priority}
                            onChange={(event) => setEditForm({ ...editForm, priority: event.target.value as Story['priority'] })}
                        >
                            <option value="low">niski</option>
                            <option value="medium">średni</option>
                            <option value="high">wysoki</option>
                        </select>
                    ) : (
                        {
                            'low': 'niski',
                            'medium': 'średni',
                            'high': 'wysoki'
                        }[story.priority.toLowerCase() as 'low' | 'medium' | 'high'] || story.priority
                    )}
                </td>
                <StoryActionsCell
                    story={story}
                    isEditing={isEditing}
                    onLowerStatus={handleLowerStatus}
                    onHigherStatus={handleHigherStatus}
                    onRemove={handleDeleteStory}
                    onStartEdit={startEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onShowTasks={handleShowTasks}
                />
            </tr>
        )
    }

    return (
        <div className="notebook-grid min-h-screen w-full flex justify-center px-10 pt-32">
            <section className="w-full max-w-5xl flex flex-col items-center gap-5">
                <div className="relative w-full flex items-center justify-center">
                    <h1 className="text-2xl font-black uppercase tracking-wide dark:text-white transition-colors">Info Projektu</h1>
                    <NeuButton className="absolute right-0 !bg-blue-300 dark:!bg-blue-600" onClick={onBack}>
                        <p className="text-black dark:text-white">Wróć</p>
                    </NeuButton>
                </div>



                <ProjectInfo project={project} />
                <div className='flex flex-row w-full gap-10'>
                    <form
                        id='project-form'
                        className='flex flex-col gap-2'
                        onSubmit={async (event) => {
                            event.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <Input
                            type="text"
                            value={createForm.title}
                            placeholder="Nazwa Historii"
                            onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
                        />

                        <TextArea
                            value={createForm.description}
                            placeholder="Opis Historii"
                            onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
                        />

                        <NeuButton type='submit' className='bg-blue-700 text-xl font-bold'>
                            Dodaj
                        </NeuButton>
                    </form>
                    <div className="flex flex-col w-full text-left gap-5">
                        <StoryTable header="Kiedyś się tym zajme" headerClassName="!bg-yellow-300 dark:!bg-yellow-600" >
                            {stories.filter((story) => story.status === 'To Do').map((story) => renderStoryRow(story))}

                        </StoryTable>

                        <StoryTable header="Robię" headerClassName="!bg-blue-300 dark:!bg-blue-600" >
                            {stories.filter((story) => story.status === 'In Progress').map((story) => renderStoryRow(story))}
                        </StoryTable>

                        <StoryTable header="Zrobione" headerClassName="!bg-green-300 dark:!bg-green-600" >
                            {stories.filter((story) => story.status === 'Done').map((story) => renderStoryRow(story))}
                        </StoryTable>

                    </div>
                </div>
            </section>
        </div >
    )
}

function StoryActionsCell({
    story,
    isEditing,
    onLowerStatus,
    onHigherStatus,
    onRemove,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onShowTasks,
}: {
    story: Story
    isEditing: boolean
    onLowerStatus: (storyId: string) => Promise<void>
    onHigherStatus: (storyId: string) => Promise<void>
    onRemove: (storyId: string) => Promise<void>
    onStartEdit: (story: Story) => void
    onSaveEdit: () => Promise<void>
    onCancelEdit: () => void
    onShowTasks: (storyId: string) => void
}) {
    const storyId = story.id

    return (
        <td className={tableStyles.actionsCell}>
            <div className={tableStyles.actionsContainer}>
                <NeuButton className="!bg-amber-200 p-1 text-black" onClick={() => { void onLowerStatus(storyId) }} title="Move down" aria-label="Move down">
                    <LuArrowDown className="w-6 h-6 text-black" />
                </NeuButton>
                <NeuButton className="!bg-emerald-200 p-1 text-black" onClick={() => { void onHigherStatus(storyId) }} title="Move up" aria-label="Move up">
                    <LuArrowUp className="w-6 h-6 text-black" />
                </NeuButton>
                <NeuButton className="!bg-orange-300 p-1 text-black" title="Delete" aria-label="Delete" onClick={() => { void onRemove(storyId) }}>
                    <LuTrash2 className="w-6 h-6 text-black" />
                </NeuButton>

                {isEditing ?
                    <div className='flex flex-row gap-2'>
                        <NeuButton className="bg-green-400 p-1 text-black" onClick={() => { void onSaveEdit() }} title="Save" aria-label="Save">
                            <LuCheck className="w-6 h-6 text-black" />
                        </NeuButton>
                        <NeuButton className="bg-red-400 p-1 text-black" onClick={onCancelEdit} title="Cancel" aria-label="Cancel">
                            <LuX className="w-6 h-6 text-black" />
                        </NeuButton>
                    </div>
                    :
                    <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => onStartEdit(story)} title="Edit" aria-label="Edit">
                        <LuPencil className="w-6 h-6 text-black" />
                    </NeuButton>
                }

                <NeuButton className="!bg-purple-300 p-1 text-black" onClick={() => onShowTasks(storyId)} title="Show Tasks" aria-label="Show Tasks">
                    <LuListTodo className="w-6 h-6 text-black" />
                </NeuButton>
            </div>
        </td>
    )
}

function StoryTable({ children, header, headerClassName }: { children: React.ReactNode, header?: string, headerClassName?: string }) {
    return (
        <div>
            <h2 className={heading2Style}> {header} </h2>
            <table className={tableStyles.table}>
                <thead>
                    <tr className={`${tableStyles.headRow} ${headerClassName}`}>
                        <th>Nazwa</th>
                        <th>Opis</th>
                        <th>Data</th>
                        <th>Priorytet</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </ div>
    )
}



function ProjectInfo({ project }: { project: Project }) {
    return <div className="grid grid-cols-3 gap-2 w-full">
        <Box boxName="Id" description={project.id} />
        <Box boxName="Nazwa" description={project.name} />
        <Box boxName="Opis" description={project.description} />
    </div>

}

function Box({ description, boxName }: { description: string; boxName: string }) {
    return <div className="border-2 border-black dark:border-zinc-500 p-3 bg-white dark:bg-zinc-900 transition-colors">
        <p className="text-xs uppercase font-bold dark:text-zinc-400">{boxName}</p>
        <p className="font-mono break-all dark:text-zinc-100">{description}</p>
    </div>
}
