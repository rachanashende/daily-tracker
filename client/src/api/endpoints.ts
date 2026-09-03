import api from "./client";
import type { Habit, StudySession, Task, Goal, JournalEntry, Note } from "../types";

// ---------------- Auth ----------------
export const authApi = {
  register: (data: { name: string; email: string; password: string }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// ---------------- Dashboard ----------------
export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

// ---------------- Habits ----------------
export const habitsApi = {
  list: () => api.get<Habit[]>("/habits"),
  get: (id: string) => api.get(`/habits/${id}`),
  create: (data: Partial<Habit>) => api.post("/habits", data),
  update: (id: string, data: Partial<Habit>) => api.put(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  toggle: (id: string, body?: { date?: string; progress?: number }) => api.post(`/habits/${id}/toggle`, body || {}),
};

// ---------------- Study ----------------
export const studyApi = {
  list: (params?: Record<string, string>) => api.get<StudySession[]>("/study", { params }),
  stats: () => api.get("/study/stats"),
  create: (data: Partial<StudySession>) => api.post("/study", data),
  update: (id: string, data: Partial<StudySession>) => api.put(`/study/${id}`, data),
  delete: (id: string) => api.delete(`/study/${id}`),
};

// ---------------- Tasks ----------------
export const tasksApi = {
  list: (params?: Record<string, string>) => api.get<Task[]>("/tasks", { params }),
  create: (data: Partial<Task>) => api.post("/tasks", data),
  update: (id: string, data: Partial<Task>) => api.put(`/tasks/${id}`, data),
  toggleComplete: (id: string) => api.patch(`/tasks/${id}/complete`),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ---------------- Goals ----------------
export const goalsApi = {
  list: (params?: Record<string, string>) => api.get<Goal[]>("/goals", { params }),
  create: (data: Partial<Goal>) => api.post("/goals", data),
  update: (id: string, data: Partial<Goal>) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// ---------------- Analytics ----------------
export const analyticsApi = {
  habits: () => api.get("/analytics/habits"),
  study: () => api.get("/analytics/study"),
  productivity: () => api.get("/analytics/productivity"),
};

// ---------------- Calendar ----------------
export const calendarApi = {
  get: (month: string) => api.get("/calendar", { params: { month } }),
};

// ---------------- Settings ----------------
export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: Record<string, any>) => api.put("/settings", data),
};

// ---------------- Notifications ----------------
export const notificationsApi = {
  list: () => api.get("/notifications"),
};

// ---------------- Journal ----------------
export const journalApi = {
  list: (date?: string) => api.get<JournalEntry[]>("/journal", { params: date ? { date } : {} }),
  save: (data: Partial<JournalEntry>) => api.post("/journal", data),
  delete: (id: string) => api.delete(`/journal/${id}`),
};

// ---------------- Notes ----------------
export const notesApi = {
  list: () => api.get<Note[]>("/notes"),
  create: (data: Partial<Note>) => api.post("/notes", data),
  update: (id: string, data: Partial<Note>) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// ---------------- Export ----------------
export const exportApi = {
  csvUrl: (type: string) => `/api/export/csv?type=${type}`,
  backupUrl: () => `/api/export/backup`,
};
