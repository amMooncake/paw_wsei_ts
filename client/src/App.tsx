import { useState } from 'react'

import { projectApi } from './api/projectApi'
import DataTable from './components/dataTable'
import ProjectForm from './components/ProjectForm'
import ManageMeLogo from './components/ui/ManageMeLogo'

import type { Project } from './models/project'


export default function App() {
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())

  return (
    <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-start p-10 gap-10">
      <ManageMeLogo />

      <main className='grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 w-full max-w-7xl'>
        <ProjectForm setProjects={setProjects} />
        <div>
          <DataTable projects={projects} setProjects={setProjects} />
        </div>
      </main>
    </div>

  )
}


