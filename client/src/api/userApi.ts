import { type MyUser } from '../models/user'

const aleksy: MyUser = {
  id: '1',
  name: 'Aleksy',
  lastName: 'Malawski'
}


export const userApi = {
    getCurrentUser(): Promise<MyUser> {
        return Promise.resolve(aleksy)
    }
}