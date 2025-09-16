import React, { useState } from 'react';
import { Plus, Check, Edit, Trash2, Star, Clock, Calendar } from 'lucide-react';
import { useTodoStore } from '../store';
import { groupTasksBySection, groupTasksByCategory } from '../rules';
import TaskItem from './TaskItem';
import DraggableTaskList from './DraggableTaskList';

const formatDueTime = (dueAt: string) => {
  const due = new Date(dueAt);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  
  return due.toLocaleDateString();
};

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
    categories,
    getFilteredTasks,
    reorderTasks,
    moveTaskToCategory
  } = useTodoStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueAt, setNewTaskDueAt] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(
        newTaskTitle.trim(),
        newTaskDueAt ? new Date(newTaskDueAt).toISOString() : null,
        newTaskCategory || null,
        null // No parent for main tasks added through the form
      );
      
      // If priority is set, toggle the star after adding
      if (newTaskPriority) {
        setTimeout(() => {
          const newTask = tasks[tasks.length - 1];
          if (newTask) {
            toggleTaskStar(newTask.id);
          }
        }, 100);
      }
      
      setNewTaskTitle('');
      setNewTaskDueAt('');
      setNewTaskCategory('');
      setNewTaskPriority(false);
      setShowAdvanced(false);
    }
  };

  // Get filtered tasks from store
  const filteredTasks = getFilteredTasks();
  
  // Group tasks for display
  const groupedTasks = groupTasksBySection(filteredTasks);
  const completedTasks = tasks.filter(task => task.status === 'done' && !task.parent_id);

  const getDisplayTasks = () => {
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

  const displayTasks = getDisplayTasks();


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
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              title="More options"
            >
              <Calendar size={16} />
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              <Plus size={16} />
              <span className="text-sm">Add</span>
            </button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={newTaskDueAt}
                    onChange={(e) => setNewTaskDueAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">No category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setNewTaskPriority(!newTaskPriority)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    newTaskPriority 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Star size={16} className={newTaskPriority ? 'fill-current' : ''} />
                  <span className="text-sm">Priority</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Priority Filter Toggle */}
      <div className="px-1.5 sm:px-3 lg:px-6 py-2 border-b border-neutral-200">
        <button
          onClick={togglePriorityFilter}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showPriorityOnly 
              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Star size={16} className={showPriorityOnly ? 'fill-current' : ''} />
          <span>{showPriorityOnly ? 'Show All Tasks' : 'Show Priority Only'}</span>
        </button>
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
                <DraggableTaskList
                  tasks={sectionTasks}
                  onReorder={reorderTasks}
                  onMoveToCategory={moveTaskToCategory}
                />
                
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