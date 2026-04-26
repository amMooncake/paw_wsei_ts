import { useState, useEffect } from 'react'
import { userApi } from '../api/userApi'
import type { MyUser } from '../models/user'
import NeuButton from './ui/NeuButtonBlue'
import { LuUser, LuLock, LuKey, LuArrowLeft } from 'react-icons/lu'

interface UserListViewProps {
    onBack: () => void;
}

export default function UserListView({ onBack }: UserListViewProps) {
    const [users, setUsers] = useState<MyUser[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setLoading(true)
        const allUsers = await userApi.getAll()
        setUsers(allUsers)
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleRoleChange = async (userId: string, role: MyUser['role']) => {
        await userApi.updateRole(userId, role)
        await fetchUsers()
    }

    const handleToggleBlock = async (userId: string) => {
        await userApi.toggleBlock(userId)
        await fetchUsers()
    }

    const roles: MyUser['role'][] = ['admin', 'developer', 'devops', 'guest']

    return (
        <div className="notebook-grid min-h-screen w-full p-10 flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <NeuButton
                        onClick={onBack}
                        className="!p-2 bg-zinc-200 dark:bg-zinc-800 dark:text-white"
                    >
                        <LuArrowLeft className="w-6 h-6" />
                    </NeuButton>
                    <h1 className="text-4xl font-black uppercase dark:text-white">Zarządzanie użytkownikami</h1>
                </div>

                <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center font-black uppercase text-2xl dark:text-white">Ładowanie...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-100 dark:bg-zinc-800 border-b-4 border-black dark:border-white">
                                    <th className="p-4 font-black uppercase border-r-4 border-black dark:border-white">Użytkownik</th>
                                    <th className="p-4 font-black uppercase border-r-4 border-black dark:border-white">Email</th>
                                    <th className="p-4 font-black uppercase border-r-4 border-black dark:border-white">Rola</th>
                                    <th className="p-4 font-black uppercase">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className={`border-b-4 border-black dark:border-white last:border-b-0 ${user.isBlocked ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                        <td className="p-4 border-r-4 border-black dark:border-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-400 border-2 border-black flex items-center justify-center rounded-sm">
                                                    <LuUser className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-black dark:text-white">{user.name} {user.lastName}</div>
                                                    <div className="text-xs uppercase font-bold text-gray-500">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-4 border-black dark:border-white font-bold dark:text-gray-300">
                                            {user.email}
                                        </td>
                                        <td className="p-4 border-r-4 border-black dark:border-white">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as MyUser['role'])}
                                                className="w-full bg-yellow-200 dark:bg-yellow-600 border-2 border-black p-2 font-bold focus:outline-none"
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <NeuButton
                                                    onClick={() => handleToggleBlock(user.id)}
                                                    className={`!p-2 ${user.isBlocked ? 'bg-green-400' : 'bg-red-400'}`}
                                                    title={user.isBlocked ? 'Odblokuj' : 'Zablokuj'}
                                                >
                                                    {user.isBlocked ? <LuKey className="w-5 h-5" /> : <LuLock className="w-5 h-5" />}
                                                </NeuButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
