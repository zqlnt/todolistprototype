// Core task types matching Supabase schema
export interface Task {
  id: string;
  user_id: string;
  title: string;
  status: 'pending' | 'done';
  dueAt?: string | null;
  isStarred: boolean;
  category?: string | null;
  parent_id?: string | null;
  is_folder?: boolean;
  inserted_at: string;
  updated_at: string;
}

export interface SuggestedTask {
  id: string;
  title: string;
  dueAt?: string;
  category?: string;
  linkedEmailId?: string;
  emailSubject?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  company?: string;
  phones?: string[];
  emails?: string[];
  address?: string;
  isFavorite?: boolean;
  tags?: string[];
  linkedTaskIds?: string[];
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  participants: string[];
}

export interface Notification {
  id: string;
  type: 'task' | 'calendar' | 'chat' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
  relatedId?: string;
}

export interface TaskReminder {
  id: string;
  taskId: string;
  reminderTime: string;
  type: '1hour' | '1day' | 'custom' | 'deadline';
  isActive: boolean;
  createdAt: string;
}

export type TaskSection = 'Today' | 'Tomorrow' | 'This Week' | 'Upcoming';
export type TaskGroupingMode = 'time' | 'category';
export type AppPage = 'dashboard' | 'todos' | 'emails' | 'calendar' | 'notifications' | 'contacts' | 'chats' | 'ai' | 'connections' | 'completedTasks';
export type CalendarView = 'month' | 'week' | 'day';

export interface DashboardWidget {
  id: string;
  name: string;
  isVisible: boolean;
  order: number;
}

export interface NotificationSettings {
  app: boolean;
  email: boolean;
  sms: boolean;
  tasks: boolean;
  overdue: boolean;
  calendar: boolean;
  chat: boolean;
  system: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  snoozeDefault: number;
  showBadge: boolean;
}

export interface EmailSettings {
  accounts: Array<{
    id: string;
    email: string;
    provider: string;
    isConnected: boolean;
  }>;
  syncScope: string[];
  pullFrequency: number;
  createTasksFromStarred: boolean;
  signature: string;
  twoFactorEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  theme: 'light' | 'dark';
  defaultStartPage: AppPage;
  weekStart: 'monday' | 'sunday';
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthError {
  message: string;
  type: 'signin' | 'signup' | 'signout';
}