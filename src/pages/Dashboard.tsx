import React from 'react';
import { 
  RefreshCw, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Zap, 
  Users, 
  Bell,
  MessageCircle,
  Settings,
  Star,
  Clock,
  Send,
  Sparkles,
  Check
} from 'lucide-react';
import { useTodoStore } from '../store';
import { groupTasksBySection } from '../rules';

const Dashboard: React.FC = () => {
  const { 
    tasks, 
    emails, 
    calendarEvents, 
    contacts,
    chats,
    notifications,
    syncEmails, 
    isLoading, 
    addTask,
    toggleDone,
    setCurrentPage,
    dashboardWidgets,
    categories
  } = useTodoStore();

  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskDueAt, setNewTaskDueAt] = React.useState('');
  const [newTaskCategory, setNewTaskCategory] = React.useState('');
  const [promptText, setPromptText] = React.useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(
        newTaskTitle.trim(),
        newTaskDueAt ? new Date(newTaskDueAt).toISOString() : null,
        newTaskCategory || null,
        null // No parent for dashboard tasks
      );
      setNewTaskTitle('');
      setNewTaskDueAt('');
      setNewTaskCategory('');
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      // TODO: Integrate with LLM later
      console.log('Prompt submitted:', promptText);
      setPromptText('');
    }
  };

  const openTasks = tasks.filter(task => task.status === 'pending');
  const groupedTasks = groupTasksBySection(openTasks);
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadChats = chats.filter(c => c.unreadCount && c.unreadCount > 0);

  const formatDueTime = (dueAt: string) => {
    const due = new Date(dueAt);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `${minutes}m`;
    } else if (diffHours < 24) {
      return due.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return due.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const formatEmailTime = (receivedAt: string) => {
    const received = new Date(receivedAt);
    const now = new Date();
    const diffHours = (now.getTime() - received.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return received.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  // Generate mini calendar
  const generateMiniCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 35; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = calendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });

    const tasksWithDates = tasks.filter(task => {
      if (!task.dueAt || task.status === 'done') return false;
      const taskDue = new Date(task.dueAt);
      return taskDue >= dayStart && taskDue <= dayEnd;
    });

    return events.length + tasksWithDates.length;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === new Date().getMonth();
  };

  const miniCalendarDays = generateMiniCalendar();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="h-full p-4 max-w-full overflow-x-hidden bg-neutral-50">
      <div className="max-w-sm mx-auto lg:max-w-4xl space-y-4 pb-24 lg:pb-6">
      {/* Gemini-style Prompt Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
        <div className="flex items-center space-x-1 mb-2">
          <Sparkles size={16} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Ask Sentinel AI</h2>
        </div>
        
        <form onSubmit={handlePromptSubmit} className="flex space-x-1">
          <div className="flex-1 relative">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask me anything about your tasks, schedule, or productivity..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
            />
            <Sparkles size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>
          <button
            type="submit"
            disabled={!promptText.trim()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 flex-shrink-0"
          >
            <Send size={12} />
            <span className="text-xs">Send</span>
          </button>
        </form>
        
        <div className="grid grid-cols-2 gap-1 mt-2">
          {[
            "What's my priority for today?",
            "Schedule my tasks",
            "Find free time",
            "Summarize emails"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPromptText(suggestion)}
              className="px-2 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors border border-neutral-200 text-center"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Zap size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
          </div>
          <button
            onClick={syncEmails}
            disabled={isLoading}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-1 flex-shrink-0"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-xs">{isLoading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button className="flex flex-col items-center space-y-1 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Plus size={16} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-800 text-center">Add Task</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Calendar size={16} className="text-green-600" />
            <span className="text-xs font-medium text-green-800 text-center">Add Event</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Users size={16} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-800 text-center">Add Contact</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Mail size={16} className="text-orange-600" />
            <span className="text-xs font-medium text-orange-800 text-center">Scan Email</span>
          </button>
        </div>
      </div>

      {/* Today Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">Today Overview</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {groupedTasks.Today?.length || 0}
            </div>
            <div className="text-xs text-blue-800">Tasks</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {calendarEvents.length}
            </div>
            <div className="text-xs text-green-800">Events</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {emails.length}
            </div>
            <div className="text-xs text-purple-800">Emails</div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {unreadNotifications.length}
            </div>
            <div className="text-xs text-orange-800">Alerts</div>
          </div>
        </div>
      </div>

      {/* Two column layout for larger screens */}
      <div className="space-y-3">
        {/* Mini Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentPage('calendar')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Full
            </button>
          </div>
          
          {/* Calendar grid */}
          <div className="space-y-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-neutral-500 py-0.5">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px">
              {miniCalendarDays.map((day, index) => {
                const eventCount = getEventsForDay(day);
                
                return (
                  <div
                    key={index}
                    className={`h-6 flex flex-col items-center justify-center text-xs ${
                      isCurrentMonth(day) ? 'text-neutral-900' : 'text-neutral-400'
                    } ${isToday(day) ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-neutral-50'}`}
                  >
                    <span>{day.getDate()}</span>
                    {eventCount > 0 && (
                      <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming List */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Upcoming</h2>
            <button
              onClick={() => setCurrentPage('todos')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(groupedTasks).map(([section, sectionTasks]) => {
              if (sectionTasks.length === 0) return null;
              
              return (
                <div key={section}>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
                    {section}
                  </h3>
                  <div className="space-y-1">
                    {sectionTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 py-1">
                        <button
                          onClick={() => toggleDone(task.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                            task.status === 'done' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-neutral-300 hover:border-neutral-400'
                          }`}
                        >
                          {task.status === 'done' && <Check size={10} className="text-green-500" />}
                        </button>
                        
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="flex items-center space-x-1 min-w-0">
                            <span className="text-xs text-neutral-900 truncate">
                              {task.title}
                            </span>
                            {task.isStarred && (
                              <Star size={10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                            )}
                          </div>
                          
                          {task.dueAt && (
                            <span className="text-xs text-neutral-600 flex-shrink-0">
                              {formatDueTime(task.dueAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {sectionTasks.length > 2 && (
                      <div className="text-xs text-neutral-500 text-center">
                        +{sectionTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Bell size={18} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Notifications</h2>
              {unreadNotifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('notifications')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className={`p-2 rounded-lg ${notification.isRead ? 'bg-neutral-50' : 'bg-blue-50'}`}>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === 'task' && <CheckSquare size={12} className="text-blue-500" />}
                    {notification.type === 'calendar' && <Calendar size={12} className="text-green-500" />}
                    {notification.type === 'chat' && <MessageCircle size={12} className="text-purple-500" />}
                    {notification.type === 'system' && <Settings size={12} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-neutral-900 truncate">{notification.title}</h4>
                    <p className="text-xs text-neutral-600 truncate">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="text-center py-2">
                <Bell size={20} className="mx-auto text-neutral-300 mb-1" />
                <p className="text-xs text-neutral-500">No notifications</p>
              </div>
            )}
          </div>
        </div>

        {/* Chats Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <MessageCircle size={18} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Chats</h2>
              {unreadChats.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)}
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('chats')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {chats.slice(0, 3).map(chat => (
              <div key={chat.id} className="flex items-center space-x-2 p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                <div className="flex-shrink-0 relative">
                  {chat.avatar ? (
                    <img 
                      src={chat.avatar} 
                      alt={chat.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                      <MessageCircle size={12} className="text-neutral-500" />
                    </div>
                  )}
                  
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-neutral-900 truncate">{chat.name}</h4>
                  {chat.lastMessage && (
                    <p className="text-xs text-neutral-600 truncate">{chat.lastMessage}</p>
                  )}
                </div>
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="text-center py-2">
                <MessageCircle size={20} className="mx-auto text-neutral-300 mb-1" />
                <p className="text-xs text-neutral-500">No chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Users size={18} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Contacts</h2>
            </div>
            <button
              onClick={() => setCurrentPage('contacts')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {contacts.slice(0, 3).map(contact => (
              <div key={contact.id} className="flex items-center space-x-2 p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  {contact.avatar ? (
                    <img 
                      src={contact.avatar} 
                      alt={contact.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                      <Users size={12} className="text-neutral-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 min-w-0">
                    <h4 className="text-xs font-medium text-neutral-900 truncate">{contact.name}</h4>
                    {contact.isFavorite && (
                      <Star size={10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                  {contact.role && (
                    <p className="text-xs text-neutral-600 truncate">
                      {contact.role}{contact.company && ` at ${contact.company}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {contacts.length === 0 && (
              <div className="text-center py-2">
                <Users size={20} className="mx-auto text-neutral-300 mb-1" />
                <p className="text-xs text-neutral-500">No contacts</p>
              </div>
            )}
          </div>
        </div>

        {/* Inbox Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Mail size={18} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Inbox</h2>
              <span className="text-xs text-neutral-500">({emails.length})</span>
            </div>
            <button
              onClick={() => setCurrentPage('emails')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {emails.length === 0 ? (
              <div className="py-4 text-center text-neutral-500">
                <Mail size={20} className="mx-auto mb-1 text-neutral-300" />
                <p className="text-xs">No emails yet</p>
              </div>
            ) : (
              emails.slice(0, 3).map((email) => (
                <div key={email.id} className="py-2 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-0.5">
                    <h3 className="text-xs font-medium text-neutral-900 truncate flex-1">
                      {email.subject}
                    </h3>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {formatEmailTime(email.receivedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 truncate">
                    {email.body.length > 80 ? email.body.substring(0, 80) + '...' : email.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* To-Do List Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mx-auto max-w-[330px] lg:max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <CheckSquare size={18} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">To-Do List</h2>
              <span className="text-xs text-neutral-500">({openTasks.length})</span>
            </div>
            <button
              onClick={() => setCurrentPage('todos')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>

          {/* Add new task */}
          <div className="mb-4 pb-3 border-b border-neutral-200 space-y-2">
            <form onSubmit={handleAddTask} className="flex space-x-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 flex-shrink-0"
              >
                <Plus size={14} />
                <span className="text-xs">Add</span>
              </button>
            </form>
            
            <div className="flex space-x-1">
              <input
                type="datetime-local"
                value={newTaskDueAt}
                onChange={(e) => setNewTaskDueAt(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">No category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Task sections */}
          <div className="space-y-3">
            {Object.entries(groupedTasks).map(([section, sectionTasks]) => {
              if (sectionTasks.length === 0) return null;
              
              return (
                <div key={section}>
                  <h3 className="text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>{section}</span>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                      {sectionTasks.length}
                    </span>
                  </h3>
                  
                  <div className="space-y-1">
                    {sectionTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 py-1">
                        <button
                          onClick={() => toggleDone(task.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                            task.status === 'done' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-neutral-300 hover:border-neutral-400'
                          }`}
                        >
                          {task.status === 'done' && <Check size={10} className="text-green-500" />}
                        </button>
                        
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="flex items-center space-x-1 min-w-0">
                            <span className="text-xs text-neutral-900 truncate">
                              {task.title}
                            </span>
                            {task.isStarred && (
                              <Star size={10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                            )}
                          </div>
                          
                          {task.dueAt && (
                            <span className="text-xs text-neutral-600 flex-shrink-0">
                              {formatDueTime(task.dueAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {sectionTasks.length > 3 && (
                      <div className="text-xs text-neutral-500 text-center">
                        +{sectionTasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;