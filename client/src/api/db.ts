import { CONFIG } from '../config';

export const db = {
  async get<T>(endpoint: string): Promise<T[]> {
    const res = await fetch(`${CONFIG.API_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  },
  
  async getById<T>(endpoint: string, id: string): Promise<T> {
    const res = await fetch(`${CONFIG.API_URL}/${endpoint}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}/${id}`);
    return res.json();
  },

  async create<T>(endpoint: string, data: T): Promise<T> {
    const res = await fetch(`${CONFIG.API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error in ${endpoint}:`, errorText);
      throw new Error(`Failed to create in ${endpoint}: ${errorText}`);
    }
    return res.json();
  },

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    const res = await fetch(`${CONFIG.API_URL}/${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update ${endpoint}/${id}`);
    return res.json();
  },

  async delete(endpoint: string, id: string): Promise<void> {
    const res = await fetch(`${CONFIG.API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete ${endpoint}/${id}`);
  }
};
