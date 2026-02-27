import { useState } from 'react'
import type { Project, ProjectForm } from './models/project'
import { projectApi } from './api/projectApi'
import { LuPencil } from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";
import { LuCheck } from "react-icons/lu";
import { LuX } from 'react-icons/lu';


const emptyForm: ProjectForm = {
  name: '',
  description: '',
}

export default function App() {
  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm)
  const [editForm, setEditForm] = useState<ProjectForm>(emptyForm)
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())
  const [editingId, setEditingId] = useState<string | null>(null)

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

  function handleSubmit(event: React.ChangeEvent<HTMLFormElement>): void {
    event.preventDefault()
    projectApi.create(createForm)

    setCreateForm(emptyForm)
    setProjects(projectApi.getAll())
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

  return (
    <main className="min-h-screen flex justify-center p-10">
      <div className="flex flex-col items-center gap-10">
        <h1 className='text-3xl font-bold'>ManageMe</h1>

        <form id='project-form' className='flex flex-col gap-2' onSubmit={handleSubmit}>
          <input
            className='border-2'
            type="text"
            value={createForm.name}
            placeholder="Nazwa projektu"
            onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
          />

          <textarea
            className='border-2'
            value={createForm.description}
            placeholder="Opis projektu"
            onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
          />
          <button className='border-2' type="submit">
            dodaj
          </button>
          <button className='border-2' type="button" onClick={projectApi.logAll}>
            Wyświetl projekty
          </button>
        </form>

        <table>
          <thead>
            <tr className="[&>*]:p-2 [&>*]:border-2 [&>*]:border-collapse ">
              <th>id</th>
              <th>Nazwa</th>
              <th>Opis</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="odd:bg-gray-200 [&>*]:p-2 [&>*]:border-2 [&>*]:border-collapse">
                <td>{project.id}</td>
                <td>{editingId !== project.id ?
                  project.name
                  :
                  (<input
                    className='border-2'
                    type="text"
                    value={editForm.name}
                    placeholder="Nazwa projektu"
                    onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                  )}
                </td>
                <td>
                  {editingId !== project.id ?
                    project.description
                    :
                    (<input
                      className='border-2'
                      type="text"
                      value={editForm.description}
                      placeholder="Opis projektu"
                      onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
                    )}
                </td>
                <td>
                  <div className="flex gap-2">
                    {editingId === project.id ?
                      <div className='flex flex-row gap-2'>
                        <button type="button" title="Edytuj" aria-label="Edytuj" onClick={() => handleEdit()}>
                          <LuCheck className="w-6 h-6 bg-green-500 text-white rounded-full p-0.5" />
                        </button>
                        <button type="button" title="Anuluj" aria-label="Anuluj" onClick={() => handleCanelEdit()}>
                          <LuX className="w-6 h-6 bg-red-500 text-white rounded-full p-0.5" />
                        </button>
                      </div>
                      :
                      <button type="button" title="Edytuj" aria-label="Edytuj" onClick={() => startEdit(project)}>
                        <LuPencil className="w-6 h-6" />
                      </button>
                    }


                    <button type="button" title="Usuń" aria-label="Usuń" onClick={() => deleteProject(project.id)}>
                      <LuTrash2 className="w-6 h-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>

  )
}


