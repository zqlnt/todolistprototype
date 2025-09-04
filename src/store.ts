import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Email, CalEvent, SuggestedTask, TaskSection, Contact, Chat, Notification, AppPage, CalendarView, DashboardWidget, NotificationSettings, EmailSettings, UserProfile, AuthStatus, AuthError, TaskGroupingMode } from './types';
import { groupTasksBySection } from './rules';
import { apiService } from './services/api';
import { listTasks, createTask, setStatus, toggleStar, updateTask as updateTaskService, deleteTask as deleteTaskService } from './services/tasks';
import type { Session, User } from '@supabase/supabase-js';

interface TodoState {
  // Data
  tasks: Task[];
  suggestedTasks: SuggestedTask[];
  emails: Email[];
  calendarEvents: CalEvent[];
  contacts: Contact[];
  chats: Chat[];
  notifications: Notification[];
  
  // Authentication
  session: Session | null;
  user: User | null;
  authStatus: AuthStatus;
  authError: AuthError | null;
  
  // UI State
  sectionFilter: TaskSection | 'All' | 'Completed';
  currentPage: AppPage;
  isLoading: boolean;
  syncMessage: string;
  isSidebarOpen: boolean;
  showPriorityOnly: boolean;
  viewMode: 'list' | 'grid';
  taskGroupingMode: TaskGroupingMode;
  categories: string[];
  calendarView: CalendarView;
  dashboardWidgets: DashboardWidget[];
  
  // Settings
  notificationSettings: NotificationSettings;
  emailSettings: EmailSettings;
  userProfile: UserProfile;
  
  // Actions
  addTask: (title: string, dueAt?: string | null, category?: string | null, parentId?: string | null) => Promise<void>;
  toggleDone: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  acceptSuggestion: (suggestionId: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  syncEmails: () => Promise<void>;
  setSectionFilter: (filter: TaskSection | 'All' | 'Completed') => void;
  setCurrentPage: (page: AppPage) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  togglePriorityFilter: () => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setTaskGroupingMode: (mode: TaskGroupingMode) => void;
  addCategory: (name: string) => void;
  toggleTaskStar: (taskId: string) => void;
  setCalendarView: (view: CalendarView) => void;
  
  // Contact Actions
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
  toggleContactFavorite: (contactId: string) => void;
  
  // Chat Actions
  addChat: (chat: Omit<Chat, 'id'>) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  toggleChatPin: (chatId: string) => void;
  toggleChatMute: (chatId: string) => void;
  
  // Notification Actions
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  
  // Authentication Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearAuthError: () => void;
  fetchTasks: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const createInitialContacts = (): Contact[] => [
  {
    id: 'contact-1',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    role: 'Project Manager',
    company: 'TechCorp Inc.',
    phones: ['+1 (555) 123-4567'],
    emails: ['sarah.johnson@techcorp.com'],
    isFavorite: true,
    tags: ['work', 'project']
  },
  {
    id: 'contact-2',
    name: 'Dr. Michael Chen',
    avatar: 'https://images.pexels.com/photos/612807/pexels-photo-612807.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    role: 'Family Doctor',
    company: 'City Medical Center',
    phones: ['+1 (555) 987-6543'],
    emails: ['m.chen@citymedical.com'],
    address: '123 Medical Plaza, City, State 12345'
  },
  {
    id: 'contact-3',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    role: 'Wedding Planner',
    company: 'Perfect Events',
    phones: ['+1 (555) 456-7890'],
    emails: ['emma@perfectevents.com'],
    isFavorite: false,
    tags: ['personal', 'wedding']
  }
];

const createInitialChats = (): Chat[] => [
  {
    id: 'chat-1',
    name: 'Team Project',
    avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastMessage: 'Great work on the presentation!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 2,
    isPinned: true,
    participants: ['user', 'sarah', 'mike']
  },
  {
    id: 'chat-2',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastMessage: 'Can we reschedule the meeting?',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    participants: ['user', 'sarah']
  },
  {
    id: 'chat-3',
    name: 'Family Group',
    avatar: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastMessage: 'See you at dinner tonight!',
    lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    participants: ['user', 'mom', 'dad', 'sister']
  }
];

const createInitialNotifications = (): Notification[] => [
  {
    id: 'notif-1',
    type: 'task',
    title: 'Task Due Soon',
    message: 'Flight check-in is due in 6 hours',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    type: 'calendar',
    title: 'Meeting Reminder',
    message: 'Team meeting preparation in 2 hours',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: true
  },
  {
    id: 'notif-3',
    type: 'chat',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Sync Complete',
    message: 'Successfully synced 4 emails and found 3 suggestions',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true
  }
];

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      suggestedTasks: [],
      emails: [],
      calendarEvents: [],
      contacts: createInitialContacts(),
      chats: createInitialChats(),
      notifications: createInitialNotifications(),
      
      // Authentication state
      session: null,
      user: null,
      authStatus: 'loading',
      authError: null,
      
      sectionFilter: 'All',
      currentPage: 'dashboard',
      isLoading: false,
      syncMessage: '',
      isSidebarOpen: false,
      showPriorityOnly: false,
      viewMode: 'list',
      taskGroupingMode: 'time',
      categories: ['Building project', 'Pharmacy plan', 'To Allocate'],
      calendarView: 'month',
      dashboardWidgets: [
        { id: 'quick-actions', name: 'Quick Actions', isVisible: true, order: 1 },
        { id: 'today-overview', name: 'Today Overview', isVisible: true, order: 2 },
        { id: 'mini-calendar', name: 'Mini Calendar', isVisible: true, order: 3 },
        { id: 'upcoming-list', name: 'Upcoming List', isVisible: true, order: 4 },
        { id: 'notifications-preview', name: 'Notifications Preview', isVisible: true, order: 5 },
        { id: 'chats-preview', name: 'Chats Preview', isVisible: true, order: 6 },
        { id: 'contacts-preview', name: 'Contacts Preview', isVisible: true, order: 7 }
      ],
      
      // Settings
      notificationSettings: {
        app: true,
        email: true,
        sms: false,
        tasks: true,
        overdue: true,
        calendar: true,
        chat: true,
        system: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        snoozeDefault: 15,
        showBadge: true
      },
      emailSettings: {
        accounts: [
          { id: 'acc-1', email: 'user@example.com', provider: 'Gmail', isConnected: true }
        ],
        syncScope: ['INBOX', 'SENT'],
        pullFrequency: 15,
        createTasksFromStarred: true,
        signature: 'Best regards,\nYour Name',
        twoFactorEnabled: false
      },
      userProfile: {
        id: '',
        name: '',
        email: '',
        theme: 'light',
        defaultStartPage: 'dashboard',
        weekStart: 'monday'
      },

      // Actions
      addTask: async (title: string, dueAt?: string | null, category?: string | null, parentId?: string | null) => {
        const { session } = get();
        if (!session) return;
        
        set({ isLoading: true });
        
        try {
          const { data, error } = await createTask({
            title,
            dueAt,
            category,
            isStarred: false,
            parentId
          });
          
          if (error) {
            console.error('Error adding task:', error);
            set({ syncMessage: 'Error adding task' });
          } else {
            set({ syncMessage: 'Task added successfully!' });
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error adding task:', error);
          set({ syncMessage: 'Error adding task' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      toggleDone: async (taskId: string) => {
        const { session } = get();
        if (!session) return;
        
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newStatus = task.status === 'pending' ? 'done' : 'pending';
        set({ isLoading: true });
        
        try {
          const { error } = await setStatus(taskId, newStatus);
          
          if (error) {
            console.error('Error toggling task status:', error);
            set({ syncMessage: 'Error updating task' });
          } else {
            set({ syncMessage: 'Task status updated!' });
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error toggling task status:', error);
          set({ syncMessage: 'Error updating task' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      updateTask: async (taskId: string, updates: Partial<Task>) => {
        const { session } = get();
        if (!session) return;
        
        set({ isLoading: true });
        
        try {
          const { error } = await updateTaskService(taskId, updates);
          
          if (error) {
            console.error('Error updating task:', error);
            set({ syncMessage: 'Error updating task' });
          } else {
            set({ syncMessage: 'Task updated successfully!' });
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error updating task:', error);
          set({ syncMessage: 'Error updating task' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      deleteTask: async (taskId: string) => {
        const { session } = get();
        if (!session) return;
        
        set({ isLoading: true });
        
        try {
          const { error } = await deleteTaskService(taskId);
          
          if (error) {
            console.error('Error deleting task:', error);
            set({ syncMessage: 'Error deleting task' });
          } else {
            set({ syncMessage: 'Task deleted successfully!' });
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          set({ syncMessage: 'Error deleting task' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      acceptSuggestion: async (suggestionId: string) => {
        const { session } = get();
        if (!session) return;
        
        const suggestion = get().suggestedTasks.find(s => s.id === suggestionId);
        if (!suggestion) return;

        set({ isLoading: true });
        
        try {
          const { data, error } = await createTask({
            title: suggestion.title,
            dueAt: suggestion.dueAt || null,
            category: suggestion.category || null,
            isStarred: false
          });
          
          if (error) {
            console.error('Error accepting suggestion:', error);
            set({ syncMessage: 'Error accepting suggestion' });
          } else {
            set(state => ({
              suggestedTasks: state.suggestedTasks.filter(s => s.id !== suggestionId),
              syncMessage: 'Suggestion accepted and task added!'
            }));
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error accepting suggestion:', error);
          set({ syncMessage: 'Error accepting suggestion' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      dismissSuggestion: (suggestionId: string) => {
        set(state => ({
          suggestedTasks: state.suggestedTasks.filter(s => s.id !== suggestionId)
        }));
      },

      syncEmails: async () => {
        set({ isLoading: true, syncMessage: 'Fetching emails...' });
        
        try {
          const response = await apiService.syncEmails();

          set({ 
            emails: response.emails,
            suggestedTasks: response.suggestions,
            isLoading: false, 
            syncMessage: response.message || 'Email sync completed'
          });
          
          setTimeout(() => set({ syncMessage: '' }), 3000);
          
        } catch (error) {
          console.error('Error syncing emails:', error);
          set({ 
            isLoading: false, 
            syncMessage: 'Error syncing emails' 
          });
          setTimeout(() => set({ syncMessage: '' }), 3000);
        }
      },

      setSectionFilter: (filter: TaskSection | 'All' | 'Completed') => {
        set({ sectionFilter: filter });
      },

      setCurrentPage: (page: AppPage) => {
        set({ currentPage: page });
      },

      toggleSidebar: () => {
        set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      togglePriorityFilter: () => {
        set(state => ({ showPriorityOnly: !state.showPriorityOnly }));
      },

      setViewMode: (mode: 'list' | 'grid') => {
        set({ viewMode: mode });
      },

      setTaskGroupingMode: (mode: TaskGroupingMode) => {
        set({ taskGroupingMode: mode });
      },

      addCategory: (name: string) => {
        set(state => ({
          categories: [...state.categories, name]
        }));
      },

      toggleTaskStar: async (taskId: string) => {
        const { session } = get();
        if (!session) return;
        
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        
        set({ isLoading: true });
        
        try {
          const { error } = await toggleStar(taskId, task.isStarred);
          
          if (error) {
            console.error('Error toggling task star:', error);
            set({ syncMessage: 'Error updating task' });
          } else {
            set({ syncMessage: 'Task updated!' });
            // Refresh tasks from database
            await get().fetchTasks();
          }
        } catch (error) {
          console.error('Error toggling task star:', error);
          set({ syncMessage: 'Error updating task' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },

      setCalendarView: (view: CalendarView) => {
        set({ calendarView: view });
      },

      // Contact Actions
      addContact: (contact: Omit<Contact, 'id'>) => {
        const newContact: Contact = {
          ...contact,
          id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        set(state => ({
          contacts: [...state.contacts, newContact]
        }));
      },

      updateContact: (contactId: string, updates: Partial<Contact>) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === contactId ? { ...contact, ...updates } : contact
          )
        }));
      },

      deleteContact: (contactId: string) => {
        set(state => ({
          contacts: state.contacts.filter(contact => contact.id !== contactId)
        }));
      },

      toggleContactFavorite: (contactId: string) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === contactId
              ? { ...contact, isFavorite: !contact.isFavorite }
              : contact
          )
        }));
      },

      // Chat Actions
      addChat: (chat: Omit<Chat, 'id'>) => {
        const newChat: Chat = {
          ...chat,
          id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        set(state => ({
          chats: [...state.chats, newChat]
        }));
      },

      updateChat: (chatId: string, updates: Partial<Chat>) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, ...updates } : chat
          )
        }));
      },

      toggleChatPin: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
          )
        }));
      },

      toggleChatMute: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
          )
        }));
      },

      // Notification Actions
      markNotificationRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notif => ({ ...notif, isRead: true }))
        }));
      },

      deleteNotification: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.filter(notif => notif.id !== notificationId)
        }));
      },
      
      // Authentication Actions
      signIn: async (email: string, password: string) => {
        set({ authStatus: 'loading', authError: null });
        
        try {
          const response = await apiService.signIn(email, password);
          
          // Set token for future requests
          apiService.setToken(response.access_token);
          
          // Create session-like object for compatibility
          const session = {
            access_token: response.access_token,
            user: response.user
          };
          
          set({ 
            session: session as any,
            user: response.user as any,
            authStatus: 'authenticated',
            authError: null,
            userProfile: {
              ...get().userProfile,
              id: response.user.id,
              name: response.user.email?.split('@')[0] || 'User',
              email: response.user.email || ''
            }
          });
          
          // Fetch tasks after successful login
          get().fetchTasks();
        } catch (error: any) {
          set({ 
            authStatus: 'unauthenticated',
            authError: { message: error.message, type: 'signin' }
          });
        }
      },
      
      signUp: async (email: string, password: string) => {
        set({ authStatus: 'loading', authError: null });
        
        try {
          const response = await apiService.signUp(email, password);
          
          // Set token for future requests
          apiService.setToken(response.access_token);
          
          // Create session-like object for compatibility
          const session = {
            access_token: response.access_token,
            user: response.user
          };
          
          set({ 
            session: session as any,
            user: response.user as any,
            authStatus: 'authenticated',
            authError: null,
            userProfile: {
              ...get().userProfile,
              id: response.user.id,
              name: response.user.email?.split('@')[0] || 'User',
              email: response.user.email || ''
            }
          });
          
          // Fetch tasks after successful signup and auto-login
          get().fetchTasks();
        } catch (error: any) {
          set({ 
            authStatus: 'unauthenticated',
            authError: { message: error.message, type: 'signup' }
          });
        }
      },
      
      signOut: async () => {
        set({ authStatus: 'loading' });
        
        try {
          await apiService.signOut();
          apiService.setToken(null);
          
          set({ 
            session: null,
            user: null,
            authStatus: 'unauthenticated',
            authError: null,
            tasks: [], // Clear tasks when logging out
            emails: [],
            calendarEvents: [],
            suggestedTasks: [],
            userProfile: {
              id: '',
              name: '',
              email: '',
              theme: 'light',
              defaultStartPage: 'dashboard',
              weekStart: 'monday'
            }
          });
        } catch (error: any) {
          set({ 
            authError: { message: error.message, type: 'signout' }
          });
        }
      },
      
      setSession: (session: Session | null) => {
        if (session) {
          apiService.setToken(session.access_token);
        } else {
          apiService.setToken(null);
        }
        
        set({ 
          session,
          user: session?.user || null,
          authStatus: session ? 'authenticated' : 'unauthenticated',
          userProfile: session?.user ? {
            ...get().userProfile,
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || ''
          } : {
            id: '',
            name: '',
            email: '',
            theme: 'light',
            defaultStartPage: 'dashboard',
            weekStart: 'monday'
          }
        });
      },
      
      clearAuthError: () => {
        set({ authError: null });
      },
      
      fetchTasks: async () => {
        const { session } = get();
        if (!session) return;
        
        set({ isLoading: true });
        
        try {
          const { data, error } = await listTasks();
          
          if (error) {
            console.error('Error fetching tasks:', error);
            set({ syncMessage: 'Error fetching tasks' });
          } else {
            set({ 
              tasks: data || [],
              syncMessage: 'Tasks loaded successfully'
            });
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ syncMessage: 'Error fetching tasks' });
        }
        
        set({ isLoading: false });
        setTimeout(() => set({ syncMessage: '' }), 3000);
      },
      
      updateUserProfile: (updates: Partial<UserProfile>) => {
        set(state => ({
          userProfile: { ...state.userProfile, ...updates }
        }));
      },
    }),
    {
      name: 'smart-todo-storage',
      partialize: (state) => ({ 
        contacts: state.contacts,
        chats: state.chats,
        categories: state.categories,
        userProfile: state.userProfile,
        notificationSettings: state.notificationSettings,
        emailSettings: state.emailSettings
      }),
    }
  )
);

// Initialize auth state from localStorage or session storage if needed
// This replaces the Supabase auth state listener
const initializeAuth = () => {
  // Check for stored session/token and restore if valid
  // This is a simplified version - you might want to implement proper token refresh
  const storedToken = localStorage.getItem('auth_token');
  if (storedToken) {
    apiService.setToken(storedToken);
    // Optionally verify token validity with backend
  }
};

initializeAuth();