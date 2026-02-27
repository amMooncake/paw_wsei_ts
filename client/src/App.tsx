import { useState } from 'react'

import { projectApi } from './api/projectApi'
import DataTable from './components/dataTable'
import ProjectForm from './components/ProjectForm'

import type { Project } from './models/project'


export default function App() {
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())

  return (
    <main  className="notebook-grid min-h-screen w-full flex flex-col items-center justify-start p-10 gap-10">

      <h1 className='text-3xl font-bold'>ManageMe</h1>
      <ProjectForm setProjects={setProjects} />
      <DataTable projects={projects} setProjects={setProjects} />

    </main>
  )
}


