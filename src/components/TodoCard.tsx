import React, { useState } from 'react';
import { Plus, Check, Edit, Trash2, Star } from 'lucide-react';
import { useTodoStore } from '../store';
import { groupTasksBySection, groupTasksByCategory } from '../rules';
import TaskItem from './TaskItem';

const TodoCard: React.FC = () => {
  const { 
    tasks, 
    suggestedTasks, 
    addTask, 
    toggleDone, 
    updateTask, 
    deleteTask, 
    acceptSuggestion, 
    dismissSuggestion, 
    isLoading,
    showPriorityOnly,
    toggleTaskStar,
    sectionFilter,
    taskGroupingMode,
    categories
  } = useTodoStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueAt, setNewTaskDueAt] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(
        newTaskTitle.trim(),
        newTaskDueAt ? new Date(newTaskDueAt).toISOString() : null,
        newTaskCategory || null,
        null // No parent for main tasks added through the form
      );
      setNewTaskTitle('');
      setNewTaskDueAt('');
      setNewTaskCategory('');
    }
  };

  let filteredTasks = tasks.filter(task => task.status === 'pending');
  // Only show top-level tasks (no parent) in the main list
  filteredTasks = filteredTasks.filter(task => !task.parent_id);
  
  if (showPriorityOnly) {
    filteredTasks = filteredTasks.filter(task => task.isStarred);
  }

  const groupedTasks = groupTasksBySection(filteredTasks);
  const completedTasks = tasks.filter(task => task.status === 'done' && !task.parent_id);

  const getFilteredTasks = () => {
    if (sectionFilter === 'All') {
      return groupedTasks;
    } else if (sectionFilter === 'Completed') {
      return { Completed: completedTasks };
    } else if (taskGroupingMode === 'category') {
      return groupTasksByCategory(filteredTasks);
    } else {
      return { [sectionFilter]: groupedTasks[sectionFilter] || [] };
    }
  };

  const displayTasks = getFilteredTasks();


  const renderSuggestion = (suggestion: typeof suggestedTasks[0]) => (
    <div key={suggestion.id} className="flex items-start space-x-1 sm:space-x-2 py-2 px-1 sm:px-4 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg ml-0 sm:ml-4 mb-1.5">
      <div className="w-4 h-4 rounded border-2 border-blue-300 bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
        <Plus size={12} className="text-blue-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-blue-800 font-medium leading-tight">{suggestion.title}</span>
          
          {suggestion.dueAt && (
            <span className="text-[8px] sm:text-[10px] text-blue-600 font-medium flex-shrink-0">
              {formatDueTime(suggestion.dueAt)}
            </span>
          )}
        </div>
        
        {suggestion.emailSubject && (
          <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5 opacity-70 truncate">
            From: {suggestion.emailSubject}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-0.5 flex-shrink-0">
        <button
          onClick={() => acceptSuggestion(suggestion.id)}
          className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          title="Add to tasks"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => dismissSuggestion(suggestion.id)}
          className="p-1 bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 transition-colors"
          title="Dismiss"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      {/* Add new task */}
      <div className="p-1.5 sm:p-3 lg:p-6 border-b border-neutral-200">
        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex space-x-1.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-2 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-2 py-1.5 sm:py-2 lg:px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 flex-shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline text-xs sm:text-sm">Add</span>
            </button>
          </div>
          
          <div className="flex space-x-1.5">
            <input
              type="datetime-local"
              value={newTaskDueAt}
              onChange={(e) => setNewTaskDueAt(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">No category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Task sections */}
      <div className="divide-y divide-neutral-100">
        {Object.entries(displayTasks).map(([section, sectionTasks]) => {
          if (section === 'Completed') {
            if (sectionTasks.length === 0) return null;
            
            return (
              <div key={section} className="p-1.5 sm:p-3 lg:p-6">
                <h3 className="text-xs sm:text-base font-semibold text-neutral-700 mb-2 sm:mb-4 uppercase tracking-wider">
                  {section} ({sectionTasks.length})
                </h3>
                
                <div className="space-y-0.5 sm:space-y-0">
                  {sectionTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          }
          
          if (sectionTasks.length === 0 && (!suggestedTasks || suggestedTasks.length === 0)) return null;
          
          return (
            <div key={section} className="p-1.5 sm:p-3 lg:p-6">
              <h3 className="text-xs sm:text-base font-semibold text-neutral-700 mb-2 sm:mb-4 uppercase tracking-wider">
                {section}
              </h3>
              
              <div className="space-y-0.5 sm:space-y-0">
                {sectionTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
                
                {/* Email suggestions */}
                {suggestedTasks.length > 0 && (
                  <div className="mt-1.5 sm:mt-3 lg:mt-4">
                    <div className="text-[10px] sm:text-xs font-medium text-blue-600 mb-1.5 sm:mb-3 flex items-center space-x-1 ml-1 sm:ml-4">
                      <span>Suggestions from Email</span>
                    </div>
                    {suggestedTasks.map(renderSuggestion)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoCard;