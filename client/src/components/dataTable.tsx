import { useState } from "react";
import { projectApi } from "../api/projectApi";
import type { Dispatch, SetStateAction } from "react";


import type { Project, ProjectForm } from "../models/project";
import { emptyForm } from "../models/project";


import { LuPencil, LuTrash2, LuCheck, LuX, LuSquareArrowOutUpRight } from 'react-icons/lu';

import Input from "./ui/NeuInput";
import NeuButton from "./ui/NeuButtonBlue";

import { toast } from 'react-toastify';
import { toastErrorStyle, toastSuccessStyle } from './ui/projectFormToastOptions';
import { tableStyles } from './ui/tableStyles';


type DataTableProps = {
    projects: Project[]
    setProjects: Dispatch<SetStateAction<Project[]>>
    onOpenProject: (id: string) => void
}

export default function DataTable({ projects, setProjects, onOpenProject }: DataTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null)

    const [editForm, setEditForm] = useState<ProjectForm>(emptyForm)


    async function handleEdit(): Promise<void> {
        if (editForm.name.trim() === '') {
            toast.error('Nazwa projektu nie może być pusta!', toastErrorStyle);
            return;
        }

        if (editForm.description.trim() === '') {
            toast.error('Opis projektu nie może być pusty!', toastErrorStyle);
            return;
        }

        if (!editingId) return
        projectApi.update({
            id: editingId,
            ...editForm,
        })
        setEditingId(null)
        setProjects(await projectApi.getAll())
        toast.success('Projekt został zaktualizowany.', toastSuccessStyle)
    }
    function handleCanelEdit(): void {
        setEditingId(null)
    }

    function startEdit(project: Project) {
        setEditingId(project.id)
        setEditForm({
            name: project.name,
            description: project.description,
        })
    }

    async function deleteProject(id: string) {
        await projectApi.delete(id)
        setProjects(await projectApi.getAll())

        if (editingId === id) {
            setEditingId(null)
            setEditForm(emptyForm)
        }
    }


    return <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
            <thead>
                <tr className={tableStyles.headRow}>
                    <th>Nazwa</th>
                    <th>Opis</th>
                    <th className={tableStyles.actionsHeaderCell}>Akcje</th>
                </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                    <tr key={project.id} className={tableStyles.bodyRow}>
                        <td>{editingId !== project.id ?
                            project.name
                            :
                            (<Input
                                type="text"
                                className='p-0 px-2 w-full min-w-10'
                                value={editForm.name}
                                placeholder="Nazwa projektu"
                                onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                            )}
                        </td>
                        <td>
                            {editingId !== project.id ?
                                project.description
                                :
                                (<Input
                                    type="text"
                                    className='p-0 px-2 w-full min-w-10'
                                    value={editForm.description}
                                    placeholder="Opis projektu"
                                    onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
                                )}
                        </td>
                        <td className={tableStyles.actionsCell}>
                            <div className={tableStyles.actionsContainer}>
                                {editingId === project.id ?
                                    <div className='flex flex-row gap-2'>
                                        <NeuButton className="!bg-green-400 p-1 text-black" onClick={() => handleEdit()}>
                                            <LuCheck className="w-6 h-6 text-black" />
                                        </NeuButton>
                                        <NeuButton className="!bg-red-400 p-1 text-black" onClick={() => handleCanelEdit()}>
                                            <LuX className="w-6 h-6 text-black" />
                                        </NeuButton>
                                    </div>
                                    :
                                    <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => startEdit(project)} title="Edit" aria-label="Edit">
                                        <LuPencil className="w-6 h-6 text-black" />
                                    </NeuButton>
                                }

                                <NeuButton className="!bg-orange-300 p-1 text-black" title="delete" aria-label="delete" onClick={() => deleteProject(project.id)}>
                                    <LuTrash2 className="w-6 h-6 text-black" />
                                </NeuButton>

                                <NeuButton
                                    className="!bg-purple-300 p-1 text-black"
                                    title="viewProject"
                                    aria-label="viewProject"
                                    onClick={() => onOpenProject(project.id)}
                                >
                                    <LuSquareArrowOutUpRight className="w-6 h-6 text-black" />
                                </NeuButton>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

}