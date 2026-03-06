import { useState, useEffect } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

import { projectApi } from './api/projectApi'
import { userApi } from './api/userApi'
import DataTable from './components/dataTable'
import ProjectForm from './components/ProjectForm'
import ManageMeLogo from './components/ui/ManageMeLogo'
import ProjectStories from './components/Projectstories'

import type { Project } from './models/project'
import type { MyUser } from './models/user'


// for dev
declare global {
  interface Window {
    projectApi: typeof projectApi
  }
}

window.projectApi = projectApi


export default function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentUser, setCurrentUser] = useState<MyUser | null>(null)

  useEffect(() => {
    async function loadProjects() {
      setProjects(await projectApi.getAll())
      setCurrentUser(await userApi.getCurrentUser())
    }
    void loadProjects()

  }, [])


  const currentPath = window.location.pathname
  const projectId = new URLSearchParams(window.location.search).get('id')
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0]

  function handleOpenProject(id: string): void {
    window.location.href = `/project?id=${encodeURIComponent(id)}`
  }

  const PageContent = currentPath === '/project' ? (
    <>
      {selectedProject ? (
        <ProjectStories
          project={selectedProject}
          onBack={() => {
            window.location.href = '/'
          }}
          userId={currentUser?.id ?? ''}
        />
      ) : (
        <div className="notebook-grid min-h-screen w-full flex items-center justify-center">
          <p className="font-bold uppercase tracking-wide">Loading project...</p>
        </div>
      )}
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
      <h1 className='absolute top-6 right-8 font-bold text-right'>Welcome, {currentUser?.name} {currentUser?.lastName}!</h1>
      {PageContent}
    </>
  )
}


