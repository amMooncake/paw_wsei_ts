import { useState } from 'react'
import type { Project, ProjectForm } from './models/project'
import { projectApi } from './api/projectApi'
import DataTable from './components/dataTable'


const emptyForm: ProjectForm = {
  name: '',
  description: '',
}

export default function App() {
  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm)
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())


  function handleSubmit(event: React.ChangeEvent<HTMLFormElement>): void {
    event.preventDefault()
    projectApi.create(createForm)

    setCreateForm(emptyForm)
    setProjects(projectApi.getAll())
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

        <DataTable projects={projects} setProjects={setProjects} />

      </div>
    </main>

  )
}


