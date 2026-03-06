import { useState } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

import { projectApi } from './api/projectApi'
import DataTable from './components/dataTable'
import ProjectForm from './components/ProjectForm'
import ManageMeLogo from './components/ui/ManageMeLogo'
import ProjectLocation from './components/ProjectLocation'

import { type MyUser } from './models/user'

const aleksy: MyUser = {
  id: '1',
  name: 'Aleksy',
  lastName: 'Malawski'
}

import type { Project } from './models/project'


export default function App() {
  const [projects, setProjects] = useState<Project[]>(projectApi.getAll())

  const currentPath = window.location.pathname
  const projectId = new URLSearchParams(window.location.search).get('id')

  function handleOpenProject(id: string): void {
    window.location.href = `/project?id=${encodeURIComponent(id)}`
  }

  const PageContent = currentPath === '/project' ? (
    <>
      <ProjectLocation
        projectId={projectId}
        onBack={() => {
          window.location.href = '/'
        }}
      />
    </>

  ) : (
    <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-start p-10 gap-10">

      <ToastContainer
        stacked
        position='bottom-center'
        autoClose={2500}
        theme='light'
        transition={Slide}
      />

      <ManageMeLogo />

      <main className='grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 w-full max-w-7xl'>
        <ProjectForm setProjects={setProjects} />
        <div>
          <DataTable projects={projects} setProjects={setProjects} onOpenProject={handleOpenProject} />
        </div>
      </main>
    </div>
  )

  return (
    <>
      <h1 className='absolute top-6 right-8 font-bold text-right'>Welcome, {aleksy.name} {aleksy.lastName}!</h1>
      {PageContent}
    </>
  )
}


