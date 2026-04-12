
import { useEffect, useState } from 'react'
import { LuX, LuBell } from 'react-icons/lu'
import NeuButton from './NeuButtonBlue'
import type { Notification } from '../../models/notification'

export default function NotificationDialog() {
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>
      setNotification(customEvent.detail)

      // Auto-close after 5 seconds
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }

    window.addEventListener('new-notification', handleNewNotification)
    return () => window.removeEventListener('new-notification', handleNewNotification)
  }, [])

  if (!notification) return null

  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900',
    medium: 'bg-yellow-100 dark:bg-yellow-900',
    high: 'bg-red-100 dark:bg-red-900',
  }

  return (
    <div className="fixed bottom-10 left-10 z-50 animate-in fade-in slide-in-from-left-10 duration-300">
      <div className={`border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] flex flex-col gap-4 max-w-sm ${priorityColors[notification.priority]}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <LuBell className="w-6 h-6 animate-bounce" />
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">
              {notification.title}
            </h2>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="hover:scale-110 transition-transform"
          >
            <LuX className="w-6 h-6 dark:text-white" />
          </button>
        </div>

        <p className="font-bold dark:text-gray-200">
          {notification.message}
        </p>

        <div className="flex justify-end mt-2">
          <NeuButton
            className="!px-4 !py-1 text-xs font-bold uppercase"
            onClick={() => {
              setNotification(null)
              window.location.href = '/notifications'
            }}
          >
            Zobacz wszystkie
          </NeuButton>
        </div>
      </div>
    </div>
  )
}
