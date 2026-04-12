
import { useEffect, useState } from 'react'
import { notificationApi } from '../api/notificationApi'
import type { Notification } from '../models/notification'
import { tableStyles } from './ui/tableStyles'
import NeuButton from './ui/NeuButtonBlue'
import { LuCheck, LuTrash2, LuEye, LuArrowLeft } from 'react-icons/lu'

type NotificationViewProps = {
    userId: string
    onBack: () => void
}

export default function NotificationView({ userId, onBack }: NotificationViewProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const loadNotifications = () => {
        const all = notificationApi.getAll()
        // Filter for current user only
        setNotifications(all.filter(n => n.recipientId === userId).reverse()) // Newest first
    }

    useEffect(() => {
        loadNotifications()
        window.addEventListener('notifications-updated', loadNotifications)
        return () => window.removeEventListener('notifications-updated', loadNotifications)
    }, [userId])

    const handleMarkAsRead = async (id: string) => {
        await notificationApi.markAsRead(id)
        loadNotifications()
    }

    const handleDelete = async (id: string) => {
        await notificationApi.delete(id)
        loadNotifications()
        if (selectedId === id) setSelectedId(null)
    }

    const handleSelect = async (id: string) => {
        setSelectedId(id)
        await notificationApi.markAsRead(id)
        loadNotifications()
    }

    const selectedNotification = notifications.find(n => n.id === selectedId)

    if (selectedId && selectedNotification) {
        return (
            <div className="notebook-grid min-h-screen w-full flex flex-col items-center p-10 gap-10">
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    <NeuButton
                        onClick={() => setSelectedId(null)}
                        className="self-start !bg-blue-300 dark:!bg-blue-600 flex items-center gap-2"
                    >
                        <LuArrowLeft /> Wróć do listy
                    </NeuButton>

                    <div className="border-4 border-black dark:border-white p-8 bg-white dark:bg-zinc-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.5)] flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b-4 border-black dark:border-zinc-700 pb-4">
                            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">
                                {selectedNotification.title}
                            </h2>
                            <span className={`px-4 py-1 border-2 border-black font-black uppercase text-xs ${selectedNotification.priority === 'high' ? 'bg-red-400' :
                                selectedNotification.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                                }`}>
                                {selectedNotification.priority === 'high' ? 'wysoki' :
                                    selectedNotification.priority === 'medium' ? 'średni' : 'niski'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono italic">
                            {new Date(selectedNotification.date).toLocaleString()}
                        </p>
                        <p className="text-xl font-bold mt-4 dark:text-gray-200">
                            {selectedNotification.message}
                        </p>
                        <div className="flex justify-end mt-8 gap-4">
                            <NeuButton
                                onClick={() => handleDelete(selectedNotification.id)}
                                className="!bg-rose-400"
                            >
                                <LuTrash2 className="w-6 h-6" />
                            </NeuButton>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="notebook-grid min-h-screen w-full flex flex-col items-center p-10 gap-10">
            <div className="w-full max-w-5xl flex flex-col gap-6 mt-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black uppercase dark:text-white transition-colors">
                        Twoje Powiadomienia
                    </h1>
                    <NeuButton onClick={onBack}>
                        Wróć do Pulpitu
                    </NeuButton>
                </div>

                <div className={tableStyles.wrapper}>
                    <table className={tableStyles.table}>
                        <thead>
                            <tr className={tableStyles.headRow}>
                                <th>Tytuł</th>
                                <th>Data</th>
                                <th>Priorytet</th>
                                <th>Status</th>
                                <th className={tableStyles.actionsHeaderCell}>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-10 italic text-gray-400">
                                        Brak powiadomień
                                    </td>
                                </tr>
                            ) : (
                                notifications.map(n => (
                                    <tr
                                        key={n.id}
                                        className={`${tableStyles.bodyRow} ${!n.isRead ? 'bg-zinc-50 dark:bg-zinc-800/50 font-black' : 'opacity-80'}`}
                                    >
                                        <td>{n.title}</td>
                                        <td className="text-xs">{new Date(n.date).toLocaleDateString()}</td>
                                        <td>
                                            {n.priority === 'high' ? 'wysoki' :
                                                n.priority === 'medium' ? 'średni' : 'niski'}
                                        </td>
                                        <td>{n.isRead ? 'Przeczytane' : 'NOWE'}</td>
                                        <td className={tableStyles.actionsCell}>
                                            <div className={tableStyles.actionsContainer}>
                                                <NeuButton className="!p-1 !bg-blue-300" onClick={() => handleSelect(n.id)}>
                                                    <LuEye />
                                                </NeuButton>
                                                {!n.isRead && (
                                                    <NeuButton className="!p-1 !bg-green-400" onClick={() => handleMarkAsRead(n.id)}>
                                                        <LuCheck />
                                                    </NeuButton>
                                                )}
                                                <NeuButton className="!p-1 !bg-rose-400" onClick={() => handleDelete(n.id)}>
                                                    <LuTrash2 />
                                                </NeuButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
