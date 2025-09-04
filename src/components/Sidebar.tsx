import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Folder,
  Bot,
  Users,
  MessageCircle,
  Bell,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { useTodoStore } from '../store';

const Sidebar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    setSectionFilter, 
    sectionFilter,
    categories,
    addCategory,
    tasks,
    signOut,
    userProfile
  } = useTodoStore();
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Building project', 'Pharmacy plan']);
  const [isToDoExpanded, setIsToDoExpanded] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleToDoSection = () => {
    setIsToDoExpanded(!isToDoExpanded);
  };
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const getTaskCountForSection = (section: string) => {
    if (section === 'All') {
      return tasks.filter(task => task.status === 'open').length;
    }
    
    if (section === 'Today' || section === 'Tomorrow' || section === 'This Week' || section === 'Upcoming' || section === 'Completed') {
      const now = new Date();
      
      if (section === 'Completed') {
        return tasks.filter(task => task.status === 'done').length;
      }
      
      return tasks.filter(task => {
        if (task.status === 'done') return false;
        if (!task.dueAt) return section === 'Upcoming';
        
        const due = new Date(task.dueAt);
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        if (section === 'Today') return diffDays <= 1;
        if (section === 'Tomorrow') return diffDays > 1 && diffDays <= 2;
        if (section === 'This Week') return diffDays > 2 && diffDays <= 7;
        if (section === 'Upcoming') return diffDays > 7;
        
        return false;
      }).length;
    } else {
      return tasks.filter(task => 
        task.status === 'open' && task.category === section
      ).length;
    }
  };

  const getSubtasks = (parentCategory: string) => {
    return tasks.filter(task => task.category === parentCategory);
  };

  const handleSectionClick = (section: string) => {
    setSectionFilter(section as any);
    setCurrentPage('todos');
  };
  return (
    <div className="h-screen bg-gray-100 text-gray-800 flex flex-col border-r border-gray-200 fixed top-0 left-0 w-64">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="https://i.imghippo.com/files/XHpy4525kG.png" 
            alt="Sentinel Logo" 
            className="w-8 h-8 object-contain rounded-lg"
          />
          <h1 className="text-xl font-bold text-gray-900">Sentinel</h1>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-11">Powered by Watermelon AI</p>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Pages */}
        <div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentPage('connections')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === 'connections'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <Mail size={16} />
            <span>Connections</span>
          </button>
          
          <button
            onClick={() => setCurrentPage('contacts')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === 'contacts'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <Users size={16} />
            <span>Contacts</span>
          </button>
          
          <button
            onClick={() => setCurrentPage('chats')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === 'chats'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <MessageCircle size={16} />
            <span>Chats</span>
          </button>
          
          <button
            onClick={() => setCurrentPage('notifications')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === 'notifications'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </button>
        </div>

        {/* Core Apps */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Apps
          </h3>
          
          <div className="space-y-1">
            <button
              onClick={() => setCurrentPage('emails')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentPage === 'emails'
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Mail size={16} />
              <span>Emails</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('calendar')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentPage === 'calendar'
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              <span>Calendar</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('ai')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentPage === 'ai'
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Bot size={16} />
              <span>Sentinel AI</span>
            </button>
          </div>
        </div>
        
        {/* Time Organization */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            To-Do List
          </h3>
          
          <div className="space-y-1">
            <button
              onClick={() => handleSectionClick('All')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                sectionFilter === 'All'
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckSquare size={14} />
                <span>All</span>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {getTaskCountForSection('All')}
              </span>
            </button>
            
            {(['Today', 'Tomorrow', 'This Week', 'Upcoming'] as const).map(section => (
              <button
                key={section}
                onClick={() => {
                  setSectionFilter(section);
                  setCurrentPage('todos');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  sectionFilter === section
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock size={14} />
                  <span>{section}</span>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {getTaskCountForSection(section)}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Categories
          </h3>
          
          <div className="space-y-1">
            {categories.map(category => {
              const isExpanded = expandedCategories.includes(category);
              const subtasks = getSubtasks(category);
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Folder size={14} />
                      <span>{category}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {subtasks.length}
                    </span>
                  </button>
                  
                  {isExpanded && subtasks.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                      {subtasks.map(task => (
                        <div
                          key={task.id}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${
                            task.status === 'done' 
                              ? 'text-gray-400 line-through' 
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
          
          <button
            onClick={() => {
              setSectionFilter('Completed');
              setCurrentPage('completedTasks');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPage === 'completedTasks'
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle size={14} />
              <span>Completed</span>
            </div>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {getTaskCountForSection('Completed')}
            </span>
          </button>
            {/* Add category */}
            {showAddCategory ? (
              <form onSubmit={handleAddCategory} className="px-3 py-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onBlur={() => {
                    if (!newCategoryName.trim()) {
                      setShowAddCategory(false);
                    }
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <Plus size={14} />
                <span>Add Folder</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* User Profile and Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-600">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userProfile.name}</p>
            <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
          </div>
        </div>
        
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;