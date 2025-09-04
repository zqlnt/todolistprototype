import React from 'react';
import TodoCard from '../components/TodoCard';

const TodoList: React.FC = () => {
  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <TodoCard />
    </div>
  );
};

export default TodoList;