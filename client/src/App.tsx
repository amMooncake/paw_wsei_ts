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


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    projectApi.create(form)
  }

  const getAllProjects = () => {
    console.log(projectApi.getAll())

  }


  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className='text-3xl font-bold'>ManageMe</h1>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
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


      </div>
    </main>

  )
}

export default App
