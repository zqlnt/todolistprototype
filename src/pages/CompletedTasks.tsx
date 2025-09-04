import React from 'react';
import { CheckCircle, Calendar, Star, Trash2, RotateCcw } from 'lucide-react';
import { useTodoStore } from '../store';
import { Task } from '../types';

const CompletedTasks: React.FC = () => {
  const { tasks, toggleDone, deleteTask, toggleTaskStar } = useTodoStore();

  // Get all completed tasks (including subtasks)
  const completedTasks = tasks.filter(task => task.status === 'done');
  
  // Group completed tasks by completion date
  const groupTasksByCompletionDate = (tasks: Task[]) => {
    const now = new Date();
    const groups: Record<string, Task[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    tasks.forEach(task => {
      const completedDate = new Date(task.updated_at);
      const diffHours = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (diffHours < 24) {
        groups['Today'].push(task);
      } else if (diffDays < 2) {
        groups['Yesterday'].push(task);
      } else if (diffDays < 7) {
        groups['This Week'].push(task);
      } else {
        groups['Earlier'].push(task);
      }
    });

    return groups;
  };

  const groupedCompletedTasks = groupTasksByCompletionDate(completedTasks);

  const formatCompletionTime = (updatedAt: string) => {
    const completed = new Date(updatedAt);
    const now = new Date();
    const diffHours = (now.getTime() - completed.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return completed.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const CompletedTaskItem = ({ task, level = 0 }: { task: Task; level?: number }) => {
    const subtasks = tasks.filter(t => t.parent_id === task.id && t.status === 'done');
    const isSubtask = level > 0;

    return (
      <div className="border-b border-neutral-100 last:border-b-0">
        <div className={`flex items-start space-x-2 py-2 sm:py-3 px-2 sm:px-4 hover:bg-neutral-50 transition-colors group ${
          isSubtask ? 'ml-6 sm:ml-8 border-l-2 border-neutral-200' : ''
        }`}>
          <div className={`${isSubtask ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} rounded border-2 bg-green-500 border-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <CheckCircle size={isSubtask ? 8 : 10} className={isSubtask ? 'sm:w-2.5 sm:h-2.5' : 'sm:w-3 sm:h-3'} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <span className={`${isSubtask ? 'text-xs sm:text-sm' : 'text-xs sm:text-base'} line-through text-neutral-500 leading-tight`}>
                  {task.title}
                </span>
                
                {task.isStarred && (
                  <Star size={isSubtask ? 8 : 10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                )}
              </div>
              
              <span className="text-[10px] sm:text-xs text-neutral-500 flex-shrink-0 whitespace-nowrap ml-1">
                {formatCompletionTime(task.updated_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center space-x-0.5">
                {task.category && (
                  <span className="text-[10px] sm:text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                    {task.category}
                  </span>
                )}
                {task.dueAt && (
                  <span className="text-[10px] sm:text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                    <Calendar size={8} />
                    <span>Was due {new Date(task.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </span>
                )}
                {!isSubtask && subtasks.length > 0 && (
                  <span className="text-[10px] sm:text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                    {subtasks.length} subtask{subtasks.length > 1 ? 's' : ''} completed
                  </span>
                )}
              </div>
              
              <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleDone(task.id)}
                  className="p-1 text-neutral-400 hover:text-green-600 transition-colors"
                  title="Mark as pending"
                >
                  <RotateCcw size={12} />
                </button>
                
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
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Delete permanently"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Render completed subtasks */}
        {!isSubtask && subtasks.length > 0 && (
          <div className="space-y-0">
            {subtasks.map(subtask => (
              <CompletedTaskItem key={subtask.id} task={subtask} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalCompleted = completedTasks.length;

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-neutral-200 mx-0.5 sm:mx-0">
          {/* Header */}
          <div className="p-1.5 sm:p-3 lg:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <CheckCircle size={18} className="text-green-600" />
                <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Completed Tasks</h2>
                <span className="text-xs sm:text-sm text-neutral-500">({totalCompleted})</span>
              </div>
            </div>
            
            {totalCompleted > 0 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-600">
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  <span>{totalCompleted} completed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
                  <span>{completedTasks.filter(t => t.isStarred).length} were priority</span>
                </span>
              </div>
            )}
          </div>

          {/* Completed Tasks List */}
          <div className="divide-y divide-neutral-100">
            {totalCompleted === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <CheckCircle size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500 mb-2">No completed tasks yet</p>
                <p className="text-xs text-neutral-400">Tasks you complete will appear here</p>
              </div>
            ) : (
              Object.entries(groupedCompletedTasks).map(([section, sectionTasks]) => {
                if (sectionTasks.length === 0) return null;
                
                // Only show top-level completed tasks (no parent)
                const topLevelTasks = sectionTasks.filter(task => !task.parent_id);
                if (topLevelTasks.length === 0) return null;
                
                return (
                  <div key={section} className="p-1.5 sm:p-3 lg:p-6">
                    <h3 className="text-xs sm:text-base font-semibold text-neutral-700 mb-2 sm:mb-4 uppercase tracking-wider flex items-center justify-between">
                      <span>{section}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {topLevelTasks.length}
                      </span>
                    </h3>
                    
                    <div className="space-y-0.5 sm:space-y-0">
                      {topLevelTasks.map(task => (
                        <CompletedTaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedTasks;