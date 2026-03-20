import { type MyUser, type AssignableUser } from '../models/user'

const users: Record<string, MyUser> = {
    'Aleksy': {
        id: '1',
        name: 'Aleksy',
        lastName: 'Malawski',
        role: 'admin',
    },
    'Jan': {
        id: '2',
        name: 'Jan',
        lastName: 'Kowalski',
        role: 'developer',
    },
    'Michał': {
        id: '3',
        name: 'Michał',
        lastName: 'Nowak',
        role: 'devops',
    }
}

export const userApi = {
    getAll(): Promise<MyUser[]> {
        return Promise.resolve(Object.values(users))
    },
    getAssignableUsers(): Promise<AssignableUser[]> {
        const assignable = Object.values(users).filter(
            (u) => u.role === 'developer' || u.role === 'devops'
        )
        return Promise.resolve(assignable as AssignableUser[])
    },
    getById(id: string): Promise<MyUser | null> {
        const user = Object.values(users).find(u => u.id === id)
        return Promise.resolve(user ?? null)
    },
    getCurrentUser(): Promise<MyUser> {
        return Promise.resolve(users.Aleksy)
    }
}