import React, { useState } from 'react';
import { Check, Star, Clock, Folder, FolderOpen, Trash2, Move } from 'lucide-react';
import { useTodoStore } from '../store';
import { Task } from '../types';
import SwipeableRow from './SwipeableRow';

interface MobileTaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
}

const MobileTaskItem: React.FC<MobileTaskItemProps> = ({ task, onPress }) => {
  const { toggleDone, toggleTaskStar, deleteTask, moveTaskToCategory } = useTodoStore();
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);

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

  const isFolder = task.is_folder;

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleMove = () => {
    // Move to "To Allocate" folder
    moveTaskToCategory(task.id, 'To Allocate');
  };

  return (
    <SwipeableRow
      onPrioritise={() => toggleTaskStar(task.id)}
      onDelete={handleDelete}
      onMove={handleMove}
      isPrioritized={task.isStarred}
      disabled={task.status === 'done'}
    >
      <div
        className="px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
        onClick={() => onPress(task)}
      >
        <div className="flex items-center space-x-3">
          {/* Left side - Checkbox or Folder icon */}
          {isFolder ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFolderExpanded(!isFolderExpanded);
              }}
              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isFolderExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDone(task.id);
              }}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.status === 'done' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {task.status === 'done' && <Check size={12} />}
            </button>
          )}

          {/* Center - Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </span>
              {task.isStarred && (
                <Star size={14} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
              )}
            </div>
            {task.dueAt && (
              <div className="text-xs text-gray-500 mt-1">
                {formatTimeLabel(task.dueAt)}
              </div>
            )}
          </div>

          {/* Right side - Time and priority */}
          <div className="flex items-center space-x-2">
            {task.dueAt && (
              <span className="text-xs text-gray-500">
                {formatTimeLabel(task.dueAt)}
              </span>
            )}
            {task.isStarred && (
              <Star size={14} className="text-yellow-500" fill="currentColor" />
            )}
          </div>
        </div>
      </div>
    </SwipeableRow>
  );
};

export default MobileTaskItem;
