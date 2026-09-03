export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: "light" | "dark";
  dailyReminder: boolean;
  dailyReminderTime: string;
  deadlineReminders: boolean;
  missedHabitAlerts: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  dailyTarget: number;
  unit: string;
  icon: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  archived: boolean;
  completedToday?: boolean;
  todayProgress?: number;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  progress: number;
  completed: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic?: string | null;
  duration: number;
  notes?: string | null;
  date: string;
  createdAt: string;
}

export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "InProgress" | "Completed";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  status: TaskStatus;
  completedAt?: string | null;
  createdAt: string;
}

export type GoalType = "short" | "long";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: GoalType;
  deadline?: string | null;
  progress: number;
  completed: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  mood?: string | null;
  content: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  pinned: boolean;
  color: string;
  updatedAt: string;
}

export interface DashboardSummary {
  date: string;
  habitsCompletedToday: number;
  totalHabits: number;
  studyMinutesToday: number;
  studyHoursToday: number;
  tasksCompletedToday: number;
  tasksCompletedTotal: number;
  tasksDueToday: number;
  completionPercentage: number;
  activeGoalsCount: number;
  avgGoalProgress: number;
  habits: Habit[];
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "urgent";
}
