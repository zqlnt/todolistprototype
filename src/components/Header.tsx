import React from 'react';
import { Menu, RefreshCw, Filter, Search, Star, Grid3X3, List, Clock, Folder } from 'lucide-react';
import { useTodoStore } from '../store';

const Header: React.FC = () => {
  const { 
    syncMessage, 
    toggleSidebar, 
    syncEmails, 
    isLoading, 
    showPriorityOnly, 
    togglePriorityFilter,
    viewMode,
    setViewMode,
    taskGroupingMode,
    setTaskGroupingMode,
    currentPage
  } = useTodoStore();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'DASHBOARD';
      case 'todos':
        return 'TO DO LIST';
      case 'emails':
        return 'INBOX';
      case 'calendar':
        return 'CALENDAR';
      case 'ai':
        return 'SENTINEL AI';
      case 'notifications':
        return 'NOTIFICATIONS';
      case 'contacts':
        return 'CONTACTS';
      case 'chats':
        return 'CHATS';
      case 'connections':
        return 'CONNECTIONS';
      case 'completedTasks':
        return 'COMPLETED TASKS';
      default:
        return 'TO DO LIST';
    }
  };
  return (
    <div className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      {/* Top header bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left - Hamburger menu */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
        >
          <Menu size={20} className="text-neutral-700" />
        </button>
        
        {/* Center - Title */}
        <h1 className="text-lg font-semibold text-neutral-900 absolute left-1/2 transform -translate-x-1/2">
          {getPageTitle()}
        </h1>
        
        {/* Right - Sync and Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={syncEmails}
            disabled={isLoading}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            title="Sync emails"
          >
            <RefreshCw size={18} className={`text-neutral-700 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <Filter size={18} className="text-neutral-700" />
          </button>
        </div>
      </div>
      
      {/* Second row - Search and controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 gap-3">
        {/* Left - Search bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        {/* Right - Priority toggle and view mode */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={togglePriorityFilter}
            className={`p-2.5 sm:p-2 rounded-lg transition-colors ${
              showPriorityOnly 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
            title="Show priority tasks only"
          >
            <Star size={20} className="sm:w-[18px] sm:h-[18px]" fill={showPriorityOnly ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Toggle view mode"
          >
            {viewMode === 'list' ? (
              <Grid3X3 size={20} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
            ) : (
              <List size={20} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
            )}
          </button>
          
          {currentPage === 'todos' && (
            <button
              onClick={() => setTaskGroupingMode(taskGroupingMode === 'time' ? 'category' : 'time')}
              className="p-2.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title={`Group by ${taskGroupingMode === 'time' ? 'category' : 'time'}`}
            >
              {taskGroupingMode === 'time' ? (
                <Folder size={20} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
              ) : (
                <Clock size={20} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Sync message */}
      {syncMessage && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100">
          <div className="text-sm text-indigo-700">
            {syncMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;