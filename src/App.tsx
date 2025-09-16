import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import Inbox from './pages/Inbox';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import Contacts from './pages/Contacts';
import Chats from './pages/Chats';
import SentinelAI from './pages/SentinelAI';
import Connections from './pages/Connections';
import CompletedTasks from './pages/CompletedTasks';
import Auth from './pages/Auth';
import { useTodoStore } from './store';
import { apiService } from './services/api';

function App() {
  const { currentPage, isSidebarOpen, authStatus, session, setSession, isGuestMode } = useTodoStore();

  useEffect(() => {
    // Check for existing token/session on app load
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      apiService.setToken(storedToken);
      // Verify token with backend and restore session
      apiService.getUser(storedToken).then((user) => {
        const mockSession = {
          access_token: storedToken,
          user: user
        };
        setSession(mockSession as any);
        
        // Update user profile
        const { updateUserProfile } = useTodoStore.getState();
        updateUserProfile({
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
      }).catch(() => {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        apiService.setToken(null);
        setSession(null);
      });
    } else {
      setSession(null);
    }
  }, [setSession]);

  // Show loading state while checking authentication
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if ((authStatus === 'unauthenticated' || !session) && !isGuestMode) {
    return <Auth />;
  }

  const renderCurrentPage = () => {
    console.log('App - currentPage:', currentPage);
    console.log('App - authStatus:', authStatus);
    console.log('App - session:', session);
    console.log('App - isGuestMode:', isGuestMode);
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'todos':
        console.log('App - Rendering TodoList component');
        return <TodoList />;
      case 'emails':
        return <Inbox />;
      case 'calendar':
        return <Calendar />;
      case 'notifications':
        return <Notifications />;
      case 'contacts':
        return <Contacts />;
      case 'chats':
        return <Chats />;
      case 'ai':
        return <SentinelAI />;
      case 'connections':
        return <Connections />;
      case 'completedTasks':
        return <CompletedTasks />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>
      
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => useTodoStore.getState().toggleSidebar()}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-8 overflow-auto">
          <div className="h-full">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
      
      {/* Floating Add Button - Mobile */}
      <button 
        onClick={() => {
          useTodoStore.getState().setCurrentPage('todos');
          // Focus on the task input when navigating to todos
          setTimeout(() => {
            const taskInput = document.querySelector('input[placeholder="Add a new task..."]') as HTMLInputElement;
            if (taskInput) {
              taskInput.focus();
            }
          }, 100);
        }}
        className={`fixed bottom-20 right-4 lg:hidden w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center z-30 ${
          currentPage === 'ai' ? 'hidden' : ''
        }`}
        title="Add new task"
      >
        <Plus size={20} />
      </button>

      {/* Floating Add Button - Desktop */}
      <button 
        onClick={() => {
          useTodoStore.getState().setCurrentPage('todos');
          // Focus on the task input when navigating to todos
          setTimeout(() => {
            const taskInput = document.querySelector('input[placeholder="Add a new task..."]') as HTMLInputElement;
            if (taskInput) {
              taskInput.focus();
            }
          }, 100);
        }}
        className={`fixed bottom-8 right-8 hidden lg:flex w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center z-30 ${
          currentPage === 'ai' ? 'hidden' : ''
        }`}
        title="Add new task"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default App;