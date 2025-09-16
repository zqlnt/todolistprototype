import React, { useState } from 'react';
import { X, Folder, Plus } from 'lucide-react';
import { useTodoStore } from '../store';

interface MoveTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentCategory?: string;
}

const MoveTaskModal: React.FC<MoveTaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  currentCategory
}) => {
  const { categories, updateTask, addCategory } = useTodoStore();
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleMove = async () => {
    if (selectedCategory !== currentCategory) {
      await updateTask(taskId, { category: selectedCategory || null });
    }
    onClose();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Move Task</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === ''
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Folder size={16} />
                <span>No Category</span>
              </button>

              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </button>
              ))}

              {showAddCategory ? (
                <form onSubmit={handleAddCategory} className="px-3 py-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    onBlur={() => {
                      if (!newCategoryName.trim()) {
                        setShowAddCategory(false);
                      }
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add New Category</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Move Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveTaskModal;
