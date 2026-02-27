import { useState } from 'react'
import type { Project } from './models/project'
import { projectApi } from './api/projectApi'

type ProjectForm = Omit<Project, 'id'>

const emptyForm: ProjectForm = {
  name: '',
  description: '',
}

function App() {
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    projectApi.create(form)
    setForm(emptyForm)
    setProjects(projectApi.getAll())
  }

  const getAllProjects = () => {
    projectApi.logAll()
  }




  return (
    <main className="min-h-screen flex justify-center p-10">
      <div className="flex flex-col items-center gap-10">
        <h1 className='text-3xl font-bold'>ManageMe</h1>

        <form id='project-form' className='flex flex-col gap-2' onSubmit={handleSubmit}>
          <input
            className='border-2'
            type="text"
            value={form.name}
            placeholder="Nazwa projektu"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <textarea
            className='border-2'
            value={form.description}
            placeholder="Opis projektu"
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <button className='border-2' type="submit">
            Dodaj
          </button>
          <button className='border-2' type="button" onClick={getAllProjects}>
            Wyświetl projekty
          </button>

        </form>

        <table>
          <thead>
            <tr className="[&>*]:p-2">
              <th>id</th>
              <th>Nazwa</th>
              <th>Opis</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="odd:bg-gray-200 [&>*]:p-2">
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
              </tr>
            ))}
          </tbody>
        </table>



      </div>
    </main>

  )
}

export default App
