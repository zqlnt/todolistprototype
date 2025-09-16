import React, { useState } from 'react';
import { X, Clock, Bell, Calendar } from 'lucide-react';
import { useTodoStore } from '../store';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  dueAt?: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  dueAt
}) => {
  const { addTaskReminder, getTaskReminders, removeTaskReminder } = useTodoStore();
  const [selectedType, setSelectedType] = useState<'1hour' | '1day' | 'custom' | 'deadline'>('1hour');
  const [customTime, setCustomTime] = useState('');
  
  const existingReminders = getTaskReminders(taskId);

  const handleAddReminder = async () => {
    let reminderTime = '';
    
    if (selectedType === 'custom') {
      if (!customTime) return;
      reminderTime = customTime;
    } else if (selectedType === 'deadline' && dueAt) {
      reminderTime = dueAt;
    } else if (selectedType === '1hour' && dueAt) {
      const due = new Date(dueAt);
      const oneHourBefore = new Date(due.getTime() - 60 * 60 * 1000);
      reminderTime = oneHourBefore.toISOString();
    } else if (selectedType === '1day' && dueAt) {
      const due = new Date(dueAt);
      const oneDayBefore = new Date(due.getTime() - 24 * 60 * 60 * 1000);
      reminderTime = oneDayBefore.toISOString();
    }
    
    if (reminderTime) {
      await addTaskReminder(taskId, reminderTime, selectedType);
      onClose();
    }
  };

  const handleRemoveReminder = async (reminderId: string) => {
    await removeTaskReminder(reminderId);
  };

  const formatReminderTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `in ${minutes} minutes`;
    } else if (diffHours < 24) {
      return `in ${diffHours} hours`;
    } else {
      return `in ${diffDays} days`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Set Reminder</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">Task: {taskTitle}</p>
          </div>

          {/* Existing Reminders */}
          {existingReminders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Reminders</h4>
              <div className="space-y-2">
                {existingReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bell size={16} className="text-blue-500" />
                      <span className="text-sm text-gray-700">
                        {reminder.type === '1hour' && '1 hour before'}
                        {reminder.type === '1day' && '1 day before'}
                        {reminder.type === 'custom' && 'Custom time'}
                        {reminder.type === 'deadline' && 'At deadline'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatReminderTime(reminder.reminderTime)})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveReminder(reminder.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Reminder */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Reminder</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedType('1hour')}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedType === '1hour'
                      ? 'bg-blue-100 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1 hour before
                </button>
                <button
                  onClick={() => setSelectedType('1day')}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedType === '1day'
                      ? 'bg-blue-100 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1 day before
                </button>
                <button
                  onClick={() => setSelectedType('deadline')}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedType === 'deadline'
                      ? 'bg-blue-100 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  At deadline
                </button>
                <button
                  onClick={() => setSelectedType('custom')}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedType === 'custom'
                      ? 'bg-blue-100 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Custom time
                </button>
              </div>

              {selectedType === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Custom reminder time
                  </label>
                  <input
                    type="datetime-local"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {!dueAt && (selectedType === '1hour' || selectedType === '1day' || selectedType === 'deadline') && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  This task doesn't have a due date. Please set a due date first or use custom time.
                </p>
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
            onClick={handleAddReminder}
            disabled={!dueAt && (selectedType === '1hour' || selectedType === '1day' || selectedType === 'deadline')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
