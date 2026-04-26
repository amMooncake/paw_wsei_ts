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
import { LuBell, LuUsers, LuLogOut } from 'react-icons/lu'
import { notificationApi } from './api/notificationApi'
import NotificationView from './components/NotificationView'
import NotificationDialog from './components/ui/NotificationDialog'
import LoginView from './components/LoginView'
import GuestView from './components/GuestView'
import UserListView from './components/UserListView'


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
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [unreadCount, setUnreadCount] = useState(0)

  const loadData = async () => {
    setIsLoading(true)
    const user = await userApi.getCurrentUser()
    setCurrentUser(user)
    if (user && !user.isBlocked && user.role !== 'guest') {
      setProjects(await projectApi.getAll())
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const updateCount = () => {
      if (currentUser) {
        setUnreadCount(notificationApi.getUnreadCount(currentUser.id))
      } else {
        setUnreadCount(0)
      }
    }
    updateCount()
    window.addEventListener('notifications-updated', updateCount)
    window.addEventListener('new-notification', updateCount)
    return () => {
      window.removeEventListener('notifications-updated', updateCount)
      window.removeEventListener('new-notification', updateCount)
    }
  }, [currentUser])

  useEffect(() => {
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

  const handleLogout = async () => {
    await userApi.logout()
    setCurrentUser(null)
    window.location.href = '/'
  }

  function handleOpenProject(id: string): void {
    window.location.href = `/project?id=${encodeURIComponent(id)}`
  }

  if (isLoading) {
    return (
      <div className="notebook-grid min-h-screen w-full flex items-center justify-center dark:bg-zinc-900 dark:text-white">
        <div className="font-black text-4xl uppercase animate-bounce">ManageMe...</div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginView onLogin={loadData} />
  }

  if (currentUser.isBlocked) {
    return (
      <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-8">
        <ManageMeLogo />
        <div className="max-w-md w-full bg-red-100 dark:bg-red-900/30 border-4 border-red-600 p-8 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] flex flex-col items-center gap-6">
          <div className="text-6xl text-red-600">🚫</div>
          <h1 className="text-3xl font-black uppercase text-center dark:text-white">Konto zablokowane</h1>
          <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300">
            Twój dostęp do aplikacji został zablokowany przez administratora.
          </p>
          <NeuButton onClick={handleLogout} className="w-full bg-zinc-800 text-white">Wyloguj</NeuButton>
        </div>
      </div>
    )
  }

  if (currentUser.role === 'guest') {
    return <GuestView onLogout={() => setCurrentUser(null)} />
  }

  const currentPath = window.location.pathname
  const projectId = new URLSearchParams(window.location.search).get('id')
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0]

  let PageContent;
  if (currentPath === '/notifications') {
    PageContent = (
      <NotificationView
        userId={currentUser.id}
        onBack={() => { window.location.href = '/' }}
      />
    )
  } else if (currentPath === '/users' && currentUser.role === 'admin') {
    PageContent = (
      <UserListView onBack={() => { window.location.href = '/' }} />
    )
  } else if (currentPath === '/project') {
    PageContent = (
      <>
        {selectedProject ? (
          <ProjectStories
            project={selectedProject}
            onBack={() => {
              window.location.href = '/'
            }}
            userId={currentUser.id}
          />
        ) : (
          <div className="notebook-grid min-h-screen w-full flex items-center justify-center dark:text-white">
            <p className="font-bold uppercase tracking-wide">Loading project...</p>
          </div>
        )}
      </>
    )
  } else {
    PageContent = (
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
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="relative min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        <header className='fixed top-6 right-8 flex flex-col items-end gap-2 z-50'>
          <div className="flex items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="hidden md:block text-right">
              <h1 className='font-black uppercase text-sm dark:text-gray-300'>{currentUser.name} {currentUser.lastName}</h1>
              <div className='text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400'>{currentUser.role}</div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.role === 'admin' && (
                <div
                  className="p-1.5 hover:bg-yellow-400 cursor-pointer border-2 border-transparent hover:border-black transition-all"
                  onClick={() => { window.location.href = '/users' }}
                  title="Zarządzaj użytkownikami"
                >
                  <LuUsers className="w-5 h-5 dark:text-gray-300" />
                </div>
              )}

              <div
                className="relative cursor-pointer p-1.5 hover:bg-blue-400 border-2 border-transparent hover:border-black transition-all"
                onClick={() => { window.location.href = '/notifications' }}
                title="Powiadomienia"
              >
                <LuBell className="w-5 h-5 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 bg-red-500 border-2 border-black dark:border-white w-4 h-4 flex items-center justify-center text-[8px] font-black text-white rounded-full leading-none">
                    {unreadCount}
                  </div>
                )}
              </div>

              <div
                className="p-1.5 hover:bg-red-400 cursor-pointer border-2 border-transparent hover:border-black transition-all"
                onClick={handleLogout}
                title="Wyloguj"
              >
                <LuLogOut className="w-5 h-5 dark:text-gray-300" />
              </div>

              <div className="w-[2px] h-6 bg-black dark:bg-white mx-1" />

              <button
                className="p-1.5 font-black uppercase text-[10px] bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black hover:invert transition-all border-2 border-black"
                onClick={toggleTheme}
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </header>
        {PageContent}
        <NotificationDialog />
      </div>
    </div>
  )
}



