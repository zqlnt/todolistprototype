import React from 'react';
import { Link, Users, MessageCircle, Bell, Mail } from 'lucide-react';
import { useTodoStore } from '../store';

const BottomNav: React.FC = () => {
  const { currentPage, setCurrentPage } = useTodoStore();

  const navItems = [
    { 
      icon: Mail, 
      label: 'Connections', 
      page: 'connections' as const,
      isActive: currentPage === 'connections'
    },
    { 
      icon: Users, 
      label: 'Contacts', 
      page: 'contacts' as const,
      isActive: currentPage === 'contacts'
    },
    { 
      icon: MessageCircle, 
      label: 'Chats', 
      page: 'chats' as const,
      isActive: currentPage === 'chats'
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      page: 'notifications' as const,
      isActive: currentPage === 'notifications'
    }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 lg:hidden z-20">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(item.page)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors min-w-0 ${
              item.isActive 
                ? 'text-indigo-600' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <item.icon size={18} />
            <span className="text-xs text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;