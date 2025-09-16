import React, { useState } from 'react';
import { Check, Edit, Trash2, Star, Plus, Move } from 'lucide-react';
import { useTodoStore } from '../store';
import { Task } from '../types';
import SwipeableRow from './SwipeableRow';
import MoveTaskModal from './MoveTaskModal';

interface TaskItemProps {
  task: Task;
  level?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level = 0 }) => {
  const { 
    tasks,
    toggleDone, 
    updateTask, 
    deleteTask, 
    addTask,
    toggleTaskStar
  } = useTodoStore();
  
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);

  const formatDueTime = (dueAt: string) => {
    const due = new Date(dueAt);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
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
    } else {
      return due.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const handleEditTask = (taskId: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateTask(taskId, { title: newTitle.trim() });
    }
    setEditingTask(null);
    setEditTitle('');
  };

  const startEditing = (taskId: string, currentTitle: string) => {
    setEditingTask(taskId);
    setEditTitle(currentTitle);
  };

  const handleAddSubtask = (parentId: string, subtaskTitle: string) => {
    if (subtaskTitle.trim()) {
      addTask(subtaskTitle.trim(), null, null, parentId);
      setSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const getSubtasks = (parentId: string) => {
    return tasks.filter(t => t.parent_id === parentId);
  };

  const subtasks = getSubtasks(task.id);
  const isSubtask = level > 0;

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <SwipeableRow
        onPrioritise={() => toggleTaskStar(task.id)}
        onDelete={() => deleteTask(task.id)}
        onMove={() => setShowMoveModal(true)}
        isPrioritized={task.isStarred}
        disabled={task.status === 'done'}
        className={isSubtask ? 'ml-6 sm:ml-8 border-l-2 border-neutral-200' : ''}
      >
        <div className={`flex items-start space-x-2 py-2 sm:py-4 px-2 sm:px-4 hover:bg-neutral-50 transition-colors group ${
          isSubtask ? '' : ''
        }`}>
        <button
          onClick={() => toggleDone(task.id)}
          className={`${isSubtask ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
            task.status === 'done' 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          {task.status === 'done' && <Check size={isSubtask ? 8 : 10} className={isSubtask ? 'sm:w-2.5 sm:h-2.5' : 'sm:w-3 sm:h-3'} />}
        </button>
        
        <div className="flex-1 min-w-0">
          {editingTask === task.id ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleEditTask(task.id, editTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditTask(task.id, editTitle);
                if (e.key === 'Escape') setEditingTask(null);
              }}
              className="w-full px-2 py-1.5 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <span className={`${isSubtask ? 'text-xs sm:text-sm' : 'text-xs sm:text-base'} leading-tight ${
                    task.status === 'done' ? 'line-through text-neutral-500' : 'text-neutral-900'
                  }`}>
                    {task.title}
                  </span>
                  
                  {task.isStarred && (
                    <Star size={isSubtask ? 8 : 10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                  )}
                </div>
                
                {task.dueAt && (
                  <span className={`text-[10px] sm:text-xs font-medium flex-shrink-0 whitespace-nowrap ml-1 ${
                    new Date(task.dueAt) < new Date() 
                      ? 'text-red-600' 
                      : 'text-neutral-600'
                  }`}>
                    {formatDueTime(task.dueAt)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center space-x-0.5">
                  {task.category && (
                    <span className="text-[10px] sm:text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                      {task.category}
                    </span>
                  )}
                  {!isSubtask && subtasks.length > 0 && (
                    <span className="text-[10px] sm:text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      {subtasks.filter(s => s.status === 'done').length}/{subtasks.length} subtasks
                    </span>
                  )}
                </div>
                
                {task.status === 'pending' && (
                  <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isSubtask && (
                      <button
                        onClick={() => setShowAddSubtask(!showAddSubtask)}
                        className="p-1 text-neutral-400 hover:text-blue-600 transition-colors"
                        title="Add subtask"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleTaskStar(task.id)}
                      className={`p-1 rounded transition-colors ${
                        task.isStarred 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-neutral-400 hover:text-yellow-500'
                      }`}
                      title="Toggle priority"
                    >
                      <Star size={12} fill={task.isStarred ? 'currentColor' : 'none'} />
                    </button>
                    
                    <button
                      onClick={() => setShowMoveModal(true)}
                      className="p-1 text-neutral-400 hover:text-blue-600 transition-colors"
                      title="Move task"
                    >
                      <Move size={12} />
                    </button>
                    
                    <button
                      onClick={() => startEditing(task.id, task.title)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </SwipeableRow>
      
      {/* Add subtask form */}
      {showAddSubtask && task.status === 'pending' && !isSubtask && (
        <div className="ml-6 sm:ml-8 px-2 sm:px-4 py-2 bg-blue-50 border-l-2 border-blue-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (subtaskTitle.trim()) {
                handleAddSubtask(task.id, subtaskTitle);
              }
            }}
            className="flex space-x-1"
          >
            <input
              type="text"
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              placeholder="Add a subtask..."
              className="flex-1 px-2 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              Add
            </button>
          </form>
        </div>
      )}
      
      {/* Render subtasks */}
      {!isSubtask && subtasks.length > 0 && (
        <div className="space-y-0">
          {subtasks.map(subtask => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </div>
      )}

      {/* Move Task Modal */}
      <MoveTaskModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        taskId={task.id}
        currentCategory={task.category || undefined}
      />
    </div>
  );
};

export default TaskItem;