export interface BaseUser {
    id: string;
    name: string;
    lastName: string;
}

export interface AdminUser extends BaseUser {
    role: 'admin';
}

export interface DeveloperUser extends BaseUser {
    role: 'developer';
}

export interface DevOpsUser extends BaseUser {
    role: 'devops';
}

export type MyUser = AdminUser | DeveloperUser | DevOpsUser;

export type AssignableUser = DeveloperUser | DevOpsUser;