import React, { useState } from 'react';
import { Bell, Filter, Check, Trash2, Clock, Calendar, MessageCircle, Settings } from 'lucide-react';
import { useTodoStore } from '../store';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification 
  } = useTodoStore();
  
  const [filter, setFilter] = useState<'all' | 'tasks' | 'calendar' | 'chats' | 'system'>('all');

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    const now = new Date();
    const notifDate = new Date(notif.createdAt);
    const diffHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);
    
    let group = 'Earlier';
    if (diffHours < 24) {
      group = 'Today';
    } else if (diffHours < 48) {
      group = 'Yesterday';
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <Check size={16} className="text-blue-500" />;
      case 'calendar': return <Calendar size={16} className="text-green-500" />;
      case 'chat': return <MessageCircle size={16} className="text-purple-500" />;
      case 'system': return <Settings size={16} className="text-gray-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) {
      return `${Math.floor(diffMinutes)}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-neutral-200 mx-0.5 sm:mx-0">
          {/* Header */}
          <div className="p-1.5 sm:p-3 lg:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <Bell size={18} className="text-indigo-600" />
                <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Mark all
                </button>
                <Filter size={16} className="text-neutral-400" />
              </div>
            </div>
            
            {/* Filter tabs */}
            <div className="flex space-x-0.5 bg-neutral-100 rounded-lg p-0.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'tasks', label: 'Tasks' },
                { key: 'calendar', label: 'Calendar' },
                { key: 'chats', label: 'Chats' },
                { key: 'system', label: 'System' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                    filter === key
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-neutral-100">
            {Object.keys(groupedNotifications).length === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <Bell size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">No notifications</p>
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                <div key={group} className="p-2 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                    {group}
                  </h3>
                  
                  <div className="space-y-2">
                    {groupNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-2 p-2 rounded-lg transition-colors ${
                          notification.isRead ? 'bg-neutral-50' : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs sm:text-sm font-medium ${
                                notification.isRead ? 'text-neutral-700' : 'text-neutral-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-xs sm:text-sm mt-0.5 ${
                                notification.isRead ? 'text-neutral-500' : 'text-neutral-600'
                              }`}>
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-1">
                              <span className="text-[10px] sm:text-xs text-neutral-500 flex-shrink-0">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              
                              <div className="flex items-center space-x-0.5">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markNotificationRead(notification.id)}
                                    className="p-0.5 text-neutral-400 hover:text-green-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}
                                
                                <button
                                  className="p-0.5 text-neutral-400 hover:text-blue-600 transition-colors"
                                  title="Snooze"
                                >
                                  <Clock size={12} />
                                </button>
                                
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-0.5 text-neutral-400 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;