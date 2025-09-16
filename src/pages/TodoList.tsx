import React, { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import TodoCard from '../components/TodoCard';
import { useTodoStore } from '../store';

const TodoList: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategoryFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    getFilteredTasks,
    categories
  } = useTodoStore();

  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = getFilteredTasks();

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      {/* Search and Filter Bar */}
      <div className="mb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showFilters || selectedCategories.length > 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategories.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span>Sort</span>
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="created_at">Date Created</option>
            <option value="dueAt">Due Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategories.length > 0 && ` in ${selectedCategories.length} categor${selectedCategories.length !== 1 ? 'ies' : 'y'}`}
        </div>
      </div>

      <TodoCard />
    </div>
  );
};

export default TodoList;