export const CONFIG = {
    SUPER_ADMIN_EMAIL: import.meta.env.VITE_SUPER_ADMIN_EMAIL as string,
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    STORAGE_TYPE: import.meta.env.VITE_STORAGE_TYPE as 'localStorage' | 'database',
    API_URL: import.meta.env.VITE_API_URL as string,
};

