
import { storage, STORAGE_KEYS } from './storage'
import type { Notification } from '../models/notification'

export const notificationApi = {
  getAll(): Notification[] {
    return storage.get<Notification>(STORAGE_KEYS.NOTIFICATIONS)
  },

  getUnreadCount(recipientId: string): number {
    return this.getAll().filter(n => !n.isRead && n.recipientId === recipientId).length
  },

  async send(data: Omit<Notification, 'id' | 'date' | 'isRead'>): Promise<void> {
    const notifications = this.getAll()
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      isRead: false,
      ...data,
    }

    notifications.push(newNotification)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)

    // Always notify about updates
    window.dispatchEvent(new CustomEvent('notifications-updated'))

    // Dispatch custom event for real-time UI notification (e.g., Dialog)
    if (newNotification.priority === 'medium' || newNotification.priority === 'high') {
      const event = new CustomEvent('new-notification', { detail: newNotification })
      window.dispatchEvent(event)
    }
  },

  async markAsRead(id: string): Promise<void> {
    const notifications = this.getAll()
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index].isRead = true
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    }
  },

  async delete(id: string): Promise<void> {
    const notifications = this.getAll().filter(n => n.id !== id)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    window.dispatchEvent(new CustomEvent('notifications-updated'))
  }
}
