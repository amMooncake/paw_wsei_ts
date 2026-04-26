export interface BaseUser {
    id: string;
    name: string;
    lastName: string;
    email: string;
    isBlocked?: boolean;
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

export interface GuestUser extends BaseUser {
    role: 'guest';
}

export type MyUser = AdminUser | DeveloperUser | DevOpsUser | GuestUser;

export type AssignableUser = DeveloperUser | DevOpsUser;