import React, { useState } from 'react';
import SwipeableRow from './SwipeableRow';
import { Task } from '../types';

const SwipeDemo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Swipe right to prioritize this task',
      status: 'pending',
      isStarred: false,
      category: 'Demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'demo',
    },
    {
      id: '2',
      title: 'Swipe left to delete this task',
      status: 'pending',
      isStarred: true,
      category: 'Demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'demo',
    },
    {
      id: '3',
      title: 'Try keyboard navigation (Arrow keys)',
      status: 'pending',
      isStarred: false,
      category: 'Demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'demo',
    },
  ]);

  const handlePrioritize = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, isStarred: !task.isStarred, updated_at: new Date().toISOString() }
        : task
    ));
  };

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-4 text-center">Swipe Gesture Demo</h3>
      <div className="space-y-1">
        {tasks.map(task => (
          <SwipeableRow
            key={task.id}
            onPrioritise={() => handlePrioritize(task.id)}
            onDelete={() => handleDelete(task.id)}
            isPrioritized={task.isStarred}
            className="border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-3 p-3">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                task.isStarred ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
              }`}>
                {task.isStarred && <span className="text-white text-xs">★</span>}
              </div>
              <span className={`flex-1 ${task.isStarred ? 'text-amber-700 font-medium' : 'text-gray-700'}`}>
                {task.title}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {task.category}
              </span>
            </div>
          </SwipeableRow>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p><strong>Mobile:</strong> Swipe right to prioritize, left to delete</p>
        <p><strong>Desktop:</strong> Use arrow keys or click and drag</p>
        <p><strong>Keyboard:</strong> ArrowRight = prioritize, ArrowLeft = delete</p>
      </div>
    </div>
  );
};

export default SwipeDemo;
