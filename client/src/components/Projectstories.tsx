import { useEffect, useState } from 'react'

import { projectApi } from '../api/projectApi'
import { emptyStoryForm, type Project, type StoryForm, type Story } from '../models/project'
import { tableStyles } from './ui/tableStyles'

import { LuArrowDown, LuArrowUp } from "react-icons/lu";


import NeuButton from './ui/NeuButtonBlue'
import Input from './ui/NeuInput';
import TextArea from './ui/NeuTextarea';


type ProjectStoriesProps = {
    project: Project
    onBack: () => void
    userId: string
}

const heading2Style = "text-1xl font-black uppercase tracking-wide" as const

export default function ProjectStories({ project, onBack, userId }: ProjectStoriesProps) {
    const [createForm, setCreateForm] = useState<StoryForm>({ ...emptyStoryForm, ownerId: userId })
    const [stories, setStories] = useState<Story[]>([])
    const projectId = project.id


    useEffect(() => {
        async function loadStories() {
            const loadedStories = await projectApi.getStories(projectId)
            setStories(loadedStories)
        }
        void loadStories()

    }, [projectId])

    async function handleSubmit() {
        await projectApi.createStory(projectId, createForm)
        setCreateForm({ ...emptyStoryForm, ownerId: userId })
        const updatedStories = await projectApi.getStories(projectId)
        setStories(updatedStories)
    }

    async function handleLowerStatus(storyId: string) {
        await projectApi.lowerStatusStory(projectId, storyId)
        const updatedStories = await projectApi.getStories(projectId)
        setStories(updatedStories)
    }

    async function handleHigherStatus(storyId: string) {
        await projectApi.higherStatusStory(projectId, storyId)
        const updatedStories = await projectApi.getStories(projectId)
        setStories(updatedStories)
    }

    return (
        <div className="notebook-grid min-h-screen w-full flex justify-center px-10 pt-20">
            <section className="w-full max-w-5xl flex flex-col items-center gap-5">
                <div className="relative w-full flex items-center justify-center">
                    <h1 className="text-2xl font-black uppercase tracking-wide">Info Projektu</h1>
                    <NeuButton className="absolute right-0 bg-blue-300" onClick={onBack}>
                        <p className="text-black">Wróć</p>
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
                        <StoryTable header="Kiedyś się tym zajme" headerClassName="!bg-yellow-300" >
                            {stories.filter((story) => story.status === 'To Do').map((story) => (
                                <tr className={tableStyles.bodyRow} key={story.id}>
                                    <td>{story.title}</td>
                                    <td>{story.description}</td>
                                    <td>{new Date(story.creationDate).toLocaleString('pl-PL', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}</td>
                                    <td>{story.priority}</td>
                                    <td className={tableStyles.actionsCell}>
                                        <div className={tableStyles.actionsContainer}>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleLowerStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowDown className="w-6 h-6 text-black" />
                                            </NeuButton>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleHigherStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowUp className="w-6 h-6 text-black" />
                                            </NeuButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </StoryTable>

                        <StoryTable header="Robię" headerClassName="!bg-blue-300" >
                            {stories.filter((story) => story.status === 'In Progress').map((story) => (
                                <tr className={tableStyles.bodyRow} key={story.id}>
                                    <td>{story.title}</td>
                                    <td>{story.description}</td>
                                    <td>{new Date(story.creationDate).toLocaleString('pl-PL', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}</td>
                                    <td>{story.priority}</td>
                                    <td className={tableStyles.actionsCell}>
                                        <div className={tableStyles.actionsContainer}>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleLowerStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowDown className="w-6 h-6 text-black" />
                                            </NeuButton>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleHigherStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowUp className="w-6 h-6 text-black" />
                                            </NeuButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </StoryTable>

                        <StoryTable header="Zrobione" headerClassName="!bg-green-300" >
                            {stories.filter((story) => story.status === 'Done').map((story) => (
                                <tr className={tableStyles.bodyRow} key={story.id}>
                                    <td>{story.title}</td>
                                    <td>{story.description}</td>
                                    <td>{new Date(story.creationDate).toLocaleString('pl-PL', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}</td>
                                    <td>{story.priority}</td>
                                    <td className={tableStyles.actionsCell}>
                                        <div className={tableStyles.actionsContainer}>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleLowerStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowDown className="w-6 h-6 text-black" />
                                            </NeuButton>
                                            <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => { handleHigherStatus(story.id) }} title="Edit" aria-label="Edit">
                                                <LuArrowUp className="w-6 h-6 text-black" />
                                            </NeuButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </StoryTable>

                    </div>
                </div>
            </section>
        </div >
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
                        <th>priority</th>
                        <th>Actions</th>
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
    return <div className="border-2 border-black p-3 bg-white">
        <p className="text-xs uppercase font-bold">{boxName}</p>
        <p className="font-mono break-all">{description}</p>
    </div>
}
