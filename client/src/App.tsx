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
import NeuButton from './components/ui/NeuButtonBlue'


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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    async function loadData() {
      setProjects(await projectApi.getAll())
      setCurrentUser(await userApi.getCurrentUser())
    }
    void loadData()
  }, [])


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  function handleOpenProject(id: string): void {
    window.location.href = `/project?id=${encodeURIComponent(id)}`
  }

  const currentPath = window.location.pathname
  const projectId = new URLSearchParams(window.location.search).get('id')
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0]

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
        <div className="notebook-grid min-h-screen w-full flex items-center justify-center dark:text-white">
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
        theme={isDarkMode ? 'dark' : 'light'}
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
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="relative min-h-screen">
        <div className='absolute top-6 right-8 flex flex-col items-end gap-2'>
          <h1 className='font-bold text-right dark:text-gray-300'>Welcome, {currentUser?.name} {currentUser?.lastName}!</h1>
          <NeuButton
            className="!p-1 text-xs font-black uppercase tracking-tight bg-zinc-800 dark:bg-zinc-200 dark:text-black"
            onClick={toggleTheme}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </NeuButton>
        </div>
        {PageContent}
      </div>
    </div>
  )
}


