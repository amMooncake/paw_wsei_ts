
import { storage, STORAGE_KEYS } from './storage'
import type { Notification } from '../models/notification'
import { CONFIG } from '../config'
import { db } from './db'

export const notificationApi = {
  async getAll(): Promise<Notification[]> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      return db.get<Notification>('notifications')
    }
    return storage.get<Notification>(STORAGE_KEYS.NOTIFICATIONS)
  },

  async getUnreadCount(recipientId: string): Promise<number> {
    const all = await this.getAll()
    return all.filter(n => !n.isRead && n.recipientId === recipientId).length
  },

  async send(data: Omit<Notification, 'id' | 'date' | 'isRead'>): Promise<void> {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      isRead: false,
      ...data,
    }

    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.create('notifications', newNotification)
    } else {
      const notifications = await this.getAll()
      notifications.push(newNotification)
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }

    // Always notify about updates
    window.dispatchEvent(new CustomEvent('notifications-updated'))

    // Dispatch custom event for real-time UI notification (e.g., Dialog)
    if (newNotification.priority === 'medium' || newNotification.priority === 'high') {
      const event = new CustomEvent('new-notification', { detail: newNotification })
      window.dispatchEvent(event)
    }
  },

  async markAsRead(id: string): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.update('notifications', id, { isRead: true })
    } else {
      const notifications = await this.getAll()
      const index = notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications[index].isRead = true
        storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
      }
    }
    window.dispatchEvent(new CustomEvent('notifications-updated'))
  },

  async delete(id: string): Promise<void> {
    if (CONFIG.STORAGE_TYPE === 'database') {
      await db.delete('notifications', id)
    } else {
      const all = await this.getAll()
      const notifications = all.filter(n => n.id !== id)
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
    window.dispatchEvent(new CustomEvent('notifications-updated'))
  }
}
