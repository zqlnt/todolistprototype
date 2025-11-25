import React, { useState } from 'react';
import { Search, Star, MoreVertical, Plus, Check, Clock, Folder, FolderOpen } from 'lucide-react';
import { useTodoStore } from '../store';
import MobileTaskItem from './MobileTaskItem';
import MobileTaskSettingsModal from './MobileTaskSettingsModal';

const MobileTodoList: React.FC = () => {
  const {
    tasks,
    showPriorityOnly,
    togglePriorityFilter,
    searchQuery,
    setSearchQuery,
    sectionFilter,
    setSectionFilter,
    getFilteredTasks,
    categories
  } = useTodoStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showTaskSettings, setShowTaskSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const filteredTasks = getFilteredTasks();

  // Group tasks by sections
  const groupTasksBySection = (tasks: any[]) => {
    const now = new Date();
    const sections: { [key: string]: any[] } = {
      'Today': [],
      'Tomorrow': [],
      'Upcoming': [],
      'To Allocate': []
    };

    // Add user-created folders
    categories.forEach(category => {
      sections[category.name] = [];
    });

    tasks.forEach(task => {
      if (task.status === 'done') return;

      if (!task.dueAt) {
        sections['Upcoming'].push(task);
        return;
      }

      const due = new Date(task.dueAt);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        sections['To Allocate'].push(task);
      } else if (diffDays <= 1) {
        sections['Today'].push(task);
      } else if (diffDays <= 2) {
        sections['Tomorrow'].push(task);
      } else {
        sections['Upcoming'].push(task);
      }

      // Add to category if it has one
      if (task.category) {
        const category = categories.find(c => c.name === task.category);
        if (category && sections[category.name]) {
          sections[category.name].push(task);
        }
      }
    });

    return sections;
  };

  const taskSections = groupTasksBySection(filteredTasks);

  const formatTimeLabel = (dueAt: string) => {
    const due = new Date(dueAt);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `in ${minutes} min`;
    } else if (diffHours < 24) {
      return due.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return due.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setShowTaskSettings(true);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Top Bar - Search and Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={togglePriorityFilter}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showPriorityOnly 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star size={16} fill={showPriorityOnly ? 'currentColor' : 'none'} />
              <span className="text-sm">{showPriorityOnly ? 'All Tasks' : 'Priority'}</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {Object.entries(taskSections).map(([sectionName, sectionTasks]) => {
          if (sectionTasks.length === 0) return null;

          return (
            <div key={sectionName} className="bg-white border-b border-gray-100">
              {/* Section Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {sectionName}
                </h2>
              </div>

              {/* Tasks List */}
              <div className="divide-y divide-gray-100">
                {sectionTasks.map((task) => (
                  <MobileTaskItem
                    key={task.id}
                    task={task}
                    onPress={handleTaskPress}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center z-30">
        <Plus size={24} />
      </button>

      {/* Task Settings Modal */}
      <MobileTaskSettingsModal
        isOpen={showTaskSettings}
        onClose={() => {
          setShowTaskSettings(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};

export default MobileTodoList;
