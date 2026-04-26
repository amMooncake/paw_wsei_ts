import { type MyUser, type AssignableUser } from '../models/user'
import { storage, STORAGE_KEYS } from './storage'
import { CONFIG } from '../config'
import { notificationApi } from './notificationApi'

export const userApi = {
    async getAll(): Promise<MyUser[]> {
        return storage.get<MyUser>(STORAGE_KEYS.USERS)
    },

    async getAssignableUsers(): Promise<AssignableUser[]> {
        const users = await this.getAll()
        return users.filter(
            (u) => (u.role === 'developer' || u.role === 'devops') && !u.isBlocked
        ) as AssignableUser[]
    },

    async getById(id: string): Promise<MyUser | null> {
        const users = await this.getAll()
        return users.find(u => u.id === id) ?? null
    },

    async getCurrentUser(): Promise<MyUser | null> {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
        if (!raw) return null
        const currentUser = JSON.parse(raw) as MyUser
        
        // Refresh from storage to get latest role/blocked status
        const users = await this.getAll()
        const refreshed = users.find(u => u.id === currentUser.id)
        return refreshed ?? null
    },

    async loginWithGoogle(email: string, name: string, lastName: string): Promise<MyUser> {
        const users = await this.getAll()
        let user = users.find(u => u.email === email)

        if (!user) {
            // New user
            const isSuperAdmin = email === CONFIG.SUPER_ADMIN_EMAIL
            user = {
                id: crypto.randomUUID(),
                email,
                name,
                lastName,
                role: isSuperAdmin ? 'admin' : 'guest',
                isBlocked: false
            } as MyUser
            
            users.push(user)
            storage.set(STORAGE_KEYS.USERS, users)

            // Notify admins about new user
            const admins = users.filter(u => u.role === 'admin')
            for (const admin of admins) {
                await notificationApi.send({
                    recipientId: admin.id,
                    title: 'Nowy użytkownik',
                    message: `Utworzono nowe konto w systemie: ${name} ${lastName} (${email})`,
                    priority: 'high',
                })
            }
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
        return user
    },

    async logout(): Promise<void> {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    },

    async updateRole(userId: string, role: MyUser['role']): Promise<void> {
        const users = await this.getAll()
        const index = users.findIndex(u => u.id === userId)
        if (index !== -1) {
            users[index].role = role
            storage.set(STORAGE_KEYS.USERS, users)
        }
    },

    async toggleBlock(userId: string): Promise<void> {
        const users = await this.getAll()
        const index = users.findIndex(u => u.id === userId)
        if (index !== -1) {
            users[index].isBlocked = !users[index].isBlocked
            storage.set(STORAGE_KEYS.USERS, users)
        }
    }
}