/// this is helper for storing data in localStorage
const STORAGE_KEYS = {
  PROJECTS: 'projects',
  STORIES: 'stories',
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications',
} as const;

export const storage = {
  get<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn(`Storage key "${key}" does not contain an array. Resetting.`);
        return [];
      }
      return parsed as T[];
    } catch (error) {
      console.error(`Error reading from storage key "${key}":`, error);
      return [];
    }
  },

  set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to storage key "${key}":`, error);
    }
  },
};

export { STORAGE_KEYS };
