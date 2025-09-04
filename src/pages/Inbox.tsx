import React from 'react';
import { Mail, Clock, Star, Archive, Trash2, Reply, Forward } from 'lucide-react';
import { useTodoStore } from '../store';

const Inbox: React.FC = () => {
  const { emails, syncEmails, isLoading } = useTodoStore();

  const formatEmailTime = (receivedAt: string) => {
    const received = new Date(receivedAt);
    const now = new Date();
    const diffHours = (now.getTime() - received.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return received.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const getEmailPreview = (body: string) => {
    return body.length > 120 ? body.substring(0, 120) + '...' : body;
  };

  const getEmailPriority = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('urgent') || subjectLower.includes('deadline')) {
      return 'high';
    } else if (subjectLower.includes('flight') || subjectLower.includes('meeting') || subjectLower.includes('due')) {
      return 'medium';
    }
    return 'normal';
  };

  return (
    <div className="h-full p-1 sm:p-3 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-neutral-200 mx-0.5 sm:mx-0">
          {/* Inbox Header */}
          <div className="p-1.5 sm:p-3 lg:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Inbox</h2>
              <button
                onClick={syncEmails}
                disabled={isLoading}
                className="px-2 py-1.5 sm:px-3 lg:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-1 flex-shrink-0"
              >
                <Mail size={14} />
                <span className="text-xs sm:text-sm">Sync</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-600">
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full"></div>
                <span>{emails.length} emails</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span>All read</span>
              </span>
            </div>
          </div>

          {/* Email List */}
          <div className="divide-y divide-neutral-100">
            {emails.length === 0 ? (
              <div className="p-3 sm:p-6 lg:p-8 text-center">
                <Mail size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500 mb-3">No emails yet</p>
                <button
                  onClick={syncEmails}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {isLoading ? 'Syncing...' : 'Sync Emails'}
                </button>
              </div>
            ) : (
              emails.map((email) => {
                const priority = getEmailPriority(email.subject);
                
                return (
                  <div key={email.id} className="p-2 sm:p-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-2 sm:space-x-4">
                      {/* Priority indicator */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          priority === 'high' ? 'bg-red-500' :
                          priority === 'medium' ? 'bg-yellow-500' :
                          'bg-neutral-300'
                        }`}></div>
                      </div>
                      
                      {/* Email content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0.5 gap-0.5">
                          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-tight">
                            {email.subject}
                          </h3>
                          <span className="text-[10px] sm:text-xs text-neutral-500 flex-shrink-0">
                            {formatEmailTime(email.receivedAt)}
                          </span>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-neutral-600 mb-2 leading-relaxed">
                          {getEmailPreview(email.body)}
                        </p>
                        
                        {/* Email actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                            <Reply size={12} />
                            <span>Reply</span>
                          </button>
                          <button className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                            <Forward size={12} />
                            <span>Forward</span>
                          </button>
                          <button className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                            <Star size={12} />
                            <span className="hidden sm:inline">Star</span>
                          </button>
                          <button className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                            <Archive size={12} />
                            <span className="hidden sm:inline">Archive</span>
                          </button>
                          <button className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-neutral-500 hover:text-red-600 transition-colors">
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;