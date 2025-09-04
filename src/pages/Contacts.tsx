import React, { useState } from 'react';
import { Users, Search, Star, Phone, Mail, MapPin, Plus, MoreVertical } from 'lucide-react';
import { useTodoStore } from '../store';

const Contacts: React.FC = () => {
  const { contacts, toggleContactFavorite, deleteContact } = useTodoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteContacts = filteredContacts.filter(c => c.isFavorite);
  const otherContacts = filteredContacts.filter(c => !c.isFavorite);

  const ContactCard = ({ contact }: { contact: typeof contacts[0] }) => (
    <div 
      className="flex items-center space-x-2 p-2 sm:p-4 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
      onClick={() => setSelectedContact(contact.id)}
    >
      <div className="flex-shrink-0">
        {contact.avatar ? (
          <img 
            src={contact.avatar} 
            alt={contact.name}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-neutral-200 rounded-full flex items-center justify-center">
            <Users size={16} className="text-neutral-500" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <h3 className="text-xs sm:text-base font-medium text-neutral-900 truncate">
            {contact.name}
          </h3>
          {contact.isFavorite && (
            <Star size={12} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
          )}
        </div>
        
        {contact.role && (
          <p className="text-xs sm:text-sm text-neutral-600 truncate">
            {contact.role}{contact.company && ` at ${contact.company}`}
          </p>
        )}
        
        <div className="flex items-center space-x-2 mt-0.5">
          {contact.phones && contact.phones.length > 0 && (
            <div className="flex items-center space-x-0.5">
              <Phone size={12} className="text-neutral-400" />
              <span className="text-[10px] sm:text-xs text-neutral-500">{contact.phones[0]}</span>
            </div>
          )}
          {contact.emails && contact.emails.length > 0 && (
            <div className="flex items-center space-x-0.5">
              <Mail size={12} className="text-neutral-400" />
              <span className="text-[10px] sm:text-xs text-neutral-500">{contact.emails[0]}</span>
            </div>
          )}
        </div>
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
                <Users size={18} className="text-indigo-600" />
                <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Contacts</h2>
                <span className="text-xs sm:text-sm text-neutral-500">({contacts.length})</span>
              </div>
              
              <button className="px-2 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1">
                <Plus size={14} />
                <span className="text-xs sm:text-sm">Add</span>
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="divide-y divide-neutral-100">
            {filteredContacts.length === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <Users size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">No contacts found</p>
              </div>
            ) : (
              <>
                {/* Favorites */}
                {favoriteContacts.length > 0 && (
                  <div className="p-2 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider flex items-center space-x-1">
                      <Star size={12} className="text-yellow-500" />
                      <span>Favorites</span>
                    </h3>
                    <div className="space-y-0">
                      {favoriteContacts.map(contact => (
                        <ContactCard key={contact.id} contact={contact} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Contacts */}
                {otherContacts.length > 0 && (
                  <div className="p-2 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                      All Contacts
                    </h3>
                    <div className="space-y-0">
                      {otherContacts.map(contact => (
                        <ContactCard key={contact.id} contact={contact} />
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

export default Contacts;