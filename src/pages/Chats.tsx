import React from 'react';
import { MessageCircle, Search, Pin, VolumeX, Plus, MoreVertical } from 'lucide-react';
import { useTodoStore } from '../store';

const Chats: React.FC = () => {
  const { chats, toggleChatPin, toggleChatMute } = useTodoStore();

  const formatChatTime = (lastMessageAt: string) => {
    const lastMessage = new Date(lastMessageAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return lastMessage.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const pinnedChats = chats.filter(c => c.isPinned);
  const otherChats = chats.filter(c => !c.isPinned);

  const ChatCard = ({ chat }: { chat: typeof chats[0] }) => (
    <div className="flex items-center space-x-2 p-2 sm:p-4 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0">
      <div className="flex-shrink-0 relative">
        {chat.avatar ? (
          <img 
            src={chat.avatar} 
            alt={chat.name}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-neutral-200 rounded-full flex items-center justify-center">
            <MessageCircle size={16} className="text-neutral-500" />
          </div>
        )}
        
        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <h3 className="text-xs sm:text-base font-medium text-neutral-900 truncate">
              {chat.name}
            </h3>
            {chat.isPinned && (
              <Pin size={10} className="text-neutral-400 flex-shrink-0" />
            )}
            {chat.isMuted && (
              <VolumeX size={10} className="text-neutral-400 flex-shrink-0" />
            )}
          </div>
          
          {chat.lastMessageAt && (
            <span className="text-[10px] sm:text-xs text-neutral-500 flex-shrink-0 ml-1">
              {formatChatTime(chat.lastMessageAt)}
            </span>
          )}
        </div>
        
        {chat.lastMessage && (
          <p className="text-xs sm:text-sm text-neutral-600 truncate mt-0.5">
            {chat.lastMessage}
          </p>
        )}
      </div>
      
      <button className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
        <MoreVertical size={14} />
      </button>
    </div>
  );

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-neutral-200 mx-0.5 sm:mx-0">
          {/* Header */}
          <div className="p-1.5 sm:p-3 lg:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <MessageCircle size={18} className="text-indigo-600" />
                <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Chats</h2>
                <span className="text-xs sm:text-sm text-neutral-500">({chats.length})</span>
              </div>
              
              <button className="px-2 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1">
                <Plus size={14} />
                <span className="text-xs sm:text-sm">New</span>
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="divide-y divide-neutral-100">
            {chats.length === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <MessageCircle size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">No chats yet</p>
              </div>
            ) : (
              <>
                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div className="p-2 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider flex items-center space-x-1">
                      <Pin size={12} className="text-neutral-500" />
                      <span>Pinned</span>
                    </h3>
                    <div className="space-y-0">
                      {pinnedChats.map(chat => (
                        <ChatCard key={chat.id} chat={chat} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Chats */}
                {otherChats.length > 0 && (
                  <div className="p-2 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                      All Chats
                    </h3>
                    <div className="space-y-0">
                      {otherChats.map(chat => (
                        <ChatCard key={chat.id} chat={chat} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;