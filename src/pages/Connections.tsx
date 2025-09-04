import React, { useState } from 'react';
import { Search, Plus, MoreVertical, CheckCircle, Clock, Star, Link } from 'lucide-react';
import { useTodoStore } from '../store';

interface BrandConnection {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: string;
  isUnread?: boolean;
  isVerified?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  category: 'finance' | 'travel' | 'retail' | 'sports' | 'utilities';
}

const Connections: React.FC = () => {
  const { currentPage } = useTodoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'finance' | 'travel' | 'retail' | 'sports' | 'utilities'>('all');

  // Seed data for brand connections
  const [connections] = useState<BrandConnection[]>([
    {
      id: 'brand-1',
      name: 'Barclays Bank',
      avatar: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      lastMessage: 'Your statement is ready to view',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isUnread: true,
      isVerified: true,
      category: 'finance'
    },
    {
      id: 'brand-2',
      name: 'Manchester United',
      avatar: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      lastMessage: 'Congratulations for claiming your 2025 Loyalty promotion',
      lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      isVerified: true,
      category: 'sports'
    },
    {
      id: 'brand-3',
      name: 'British Airways',
      avatar: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      lastMessage: 'Your flight is confirmed for Thursday 23rd August 2025. You are eligible for an upgrade. Click below to learn more',
      lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Monday
      isVerified: true,
      isPinned: true,
      category: 'travel'
    }
  ]);

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || connection.category === filter;
    return matchesSearch && matchesFilter;
  });

  const formatConnectionTime = (lastMessageAt: string) => {
    const lastMessage = new Date(lastMessageAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return lastMessage.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays < 2) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return lastMessage.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return lastMessage.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const pinnedConnections = filteredConnections.filter(c => c.isPinned);
  const otherConnections = filteredConnections.filter(c => !c.isPinned);

  const ConnectionCard = ({ connection }: { connection: BrandConnection }) => (
    <div className="flex items-center space-x-2.5 p-3 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0">
      {/* Unread indicator */}
      {connection.isUnread && (
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
      )}
      
      {/* Brand avatar */}
      <div className="flex-shrink-0">
        <img 
          src={connection.avatar} 
          alt={connection.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center space-x-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 truncate">
              {connection.name}
            </h3>
            {connection.isVerified && (
              <CheckCircle size={12} className="text-blue-500 flex-shrink-0" fill="currentColor" />
            )}
            {connection.isPinned && (
              <Star size={10} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
            )}
          </div>
          
          <span className="text-xs text-neutral-500 flex-shrink-0 ml-1">
            {formatConnectionTime(connection.lastMessageAt)}
          </span>
        </div>
        
        <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
          {connection.lastMessage}
        </p>
      </div>
      
      <button className="p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors">
        <MoreVertical size={14} />
      </button>
    </div>
  );

  return (
    <div className="h-full p-4 max-w-full overflow-x-hidden bg-neutral-50">
      <div className="max-w-sm mx-auto lg:max-w-4xl">
        {/* Main floating card */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-neutral-200 mx-auto max-w-[335px] lg:max-w-4xl">
          {/* Card header */}
          <div className="p-5 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <Link size={18} className="text-indigo-600" />
                <h1 className="text-base lg:text-xl font-semibold text-neutral-900">Sentinel Connections</h1>
              </div>
              <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                <Search size={16} className="text-neutral-600" />
              </button>
            </div>
            
            {/* Search and Add row */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="px-3 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-1.5 flex-shrink-0">
                <Plus size={14} />
                <span className="text-sm font-medium">Discover</span>
              </button>
            </div>
            
            {/* Filter chips */}
            <div className="flex space-x-1.5 mt-3 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'finance', label: 'Finance' },
                { key: 'travel', label: 'Travel' },
                { key: 'retail', label: 'Retail' },
                { key: 'sports', label: 'Sports' },
                { key: 'utilities', label: 'Utilities' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    filter === key
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Connections List */}
          <div className="divide-y divide-neutral-100">
            {filteredConnections.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={20} className="text-neutral-400" />
                </div>
                <h3 className="text-base font-medium text-neutral-900 mb-2">No connections found</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {searchTerm ? 'Try adjusting your search terms' : 'Discover verified brands to connect with'}
                </p>
                <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Discover Brands
                </button>
              </div>
            ) : (
              <>
                {/* Pinned Connections */}
                {pinnedConnections.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider flex items-center space-x-1">
                      <Star size={10} className="text-yellow-500" />
                      <span>Pinned</span>
                    </h3>
                    <div className="space-y-0">
                      {pinnedConnections.map(connection => (
                        <ConnectionCard key={connection.id} connection={connection} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Connections */}
                {otherConnections.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                      All Connections
                    </h3>
                    <div className="space-y-0">
                      {otherConnections.map(connection => (
                        <ConnectionCard key={connection.id} connection={connection} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Privacy footer */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50 rounded-b-3xl">
            <p className="text-sm text-neutral-500 text-center leading-relaxed">
              You control which brands can message you. 
              <button className="text-indigo-600 hover:text-indigo-700 ml-1">Learn more</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;