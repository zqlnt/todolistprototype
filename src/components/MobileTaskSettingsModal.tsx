import React, { useState } from 'react';
import { X, Move, Bell, Folder, Tag, Clock } from 'lucide-react';
import { useTodoStore } from '../store';
import { Task } from '../types';

interface MobileTaskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const MobileTaskSettingsModal: React.FC<MobileTaskSettingsModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const { 
    categories, 
    updateTask, 
    addCategory, 
    convertTaskToFolder, 
    convertFolderToTask,
    addTaskReminder,
    getTaskReminders
  } = useTodoStore();

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen || !task) return null;

  const reminders = getTaskReminders(task.id);
  const isFolder = task.is_folder;

  const handleMoveToFolder = () => {
    setShowMoveModal(true);
  };

  const handleSetReminder = () => {
    setShowReminderModal(true);
  };

  const handleConvertToFolder = async () => {
    if (isFolder) {
      await convertFolderToTask(task.id);
    } else {
      await convertTaskToFolder(task.id);
    }
    onClose();
  };

  const handleChangeCategory = () => {
    setShowCategoryModal(true);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowCategoryModal(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Task Settings</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{task.title}</p>
        </div>

        {/* Options */}
        <div className="px-6 py-4 space-y-4">
          {/* Move to folder */}
          <button
            onClick={handleMoveToFolder}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Move size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Move to folder</div>
              <div className="text-sm text-gray-500">Move task to another category</div>
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={handleSetReminder}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Notifications</div>
              <div className="text-sm text-gray-500">
                {reminders.length > 0 
                  ? `${reminders.length} reminder${reminders.length !== 1 ? 's' : ''} set`
                  : 'Set 1h before / 1 day before / custom / deadline'
                }
              </div>
            </div>
          </button>

          {/* Make subfolder / Convert to task */}
          <button
            onClick={handleConvertToFolder}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Folder size={20} className="text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">
                {isFolder ? 'Convert to task' : 'Make subfolder'}
              </div>
              <div className="text-sm text-gray-500">
                {isFolder 
                  ? 'Convert this folder back to a regular task'
                  : 'Convert this task into a folder for organization'
                }
              </div>
            </div>
          </button>

          {/* Change category label */}
          <button
            onClick={handleChangeCategory}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag size={20} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Change category label</div>
              <div className="text-sm text-gray-500">
                {task.category || 'No category assigned'}
              </div>
            </div>
          </button>
        </div>

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Add New Category</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Move Task Modal */}
      <MoveTaskModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        taskId={task.id}
        currentCategory={task.category || undefined}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        taskId={task.id}
        taskTitle={task.title}
        dueAt={task.dueAt || undefined}
      />
    </>
  );
};

export default MobileTaskSettingsModal;
