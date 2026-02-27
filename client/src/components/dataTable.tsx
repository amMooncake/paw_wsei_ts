import { useState } from "react";
import { projectApi } from "../api/projectApi";
import type { Dispatch, SetStateAction } from "react";


import type { Project, ProjectForm } from "../models/project";
import { emptyForm } from "../models/project";


import { LuPencil } from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";
import { LuCheck } from "react-icons/lu";
import { LuX } from 'react-icons/lu';
import Input from "./ui/NeuInput";
import NeuButton from "./ui/NeuButtonBlue";


export default function DataTable({ projects, setProjects }: { projects: Project[], setProjects: Dispatch<SetStateAction<Project[]>> }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<ProjectForm>(emptyForm)


    function handleEdit(): void {
        if (!editingId) return
        projectApi.update({
            id: editingId,
            ...editForm,
        })
        setEditingId(null)
        setProjects(projectApi.getAll())
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

    function deleteProject(id: string) {
        projectApi.delete(id)
        setProjects(projectApi.getAll())

        if (editingId === id) {
            setEditingId(null)
            setEditForm(emptyForm)
        }
    }


    return <div className="max-w-full overflow-x-auto">
        <table className="w-auto table-auto bg-white border-b-4 border-black">
            <thead>
                <tr className="bg-yellow-300 [&>*]:p-2 [&>*]:border-2 [&>*]:border-zinc-900 [&>*]:font-black [&>*]:uppercase [&>*]:tracking-wide">
                    <th>id</th>
                    <th>Nazwa</th>
                    <th>Opis</th>
                    <th>Akcje</th>
                </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                    <tr key={project.id} className="even:bg-white odd:bg-zinc-100 [&>*]:p-2 [&>*]:border-2 [&>*]:border-black [&>*]:align-middle">
                        <td>{project.id.slice(0, 4)}...</td>
                        <td>{editingId !== project.id ?
                            project.name
                            :
                            (<Input
                                type="text"
                                className='p-0 px-2'
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
                                    className='p-0 px-2'
                                    value={editForm.description}
                                    placeholder="Opis projektu"
                                    onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
                                )}
                        </td>
                        <td>
                            <div className="flex gap-2">
                                {editingId === project.id ?
                                    <div className='flex flex-row gap-2'>
                                        <NeuButton className="bg-green-400 p-1 text-black" onClick={() => handleEdit()}>
                                            <LuCheck className="w-6 h-6 text-black" />
                                        </NeuButton>
                                        <NeuButton className="bg-red-400 p-1 text-black" onClick={() => handleCanelEdit()}>
                                            <LuX className="w-6 h-6 text-black" />
                                        </NeuButton>
                                    </div>
                                    :
                                    <NeuButton className="!bg-blue-300 p-1 text-black" onClick={() => startEdit(project)} title="Edytuj" aria-label="Edytuj">
                                        <LuPencil className="w-6 h-6 text-black" />
                                    </NeuButton>
                                }

                                <NeuButton className="bg-orange-300 p-1 text-black" title="Usuń" aria-label="Usuń" onClick={() => deleteProject(project.id)}>
                                    <LuTrash2 className="w-6 h-6 text-black" />
                                </NeuButton>

                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

}