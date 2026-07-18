import { motion } from 'framer-motion';
import { MoreVertical, Search, X } from 'lucide-react';
import { useState } from 'react';
import TypingIndicator from './TypingIndicator';

const ChatHeader = ({ 
  chat, 
  isTyping, 
  onClose, 
  onOpenProfile, 
  searchMessageQuery, 
  setSearchMessageQuery, 
  showMessageSearch, 
  setShowMessageSearch 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!chat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10 h-16"
    >
      {showMessageSearch ? (
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => {
              setSearchMessageQuery('');
              setShowMessageSearch(false);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <input
            type="text"
            value={searchMessageQuery}
            onChange={(e) => setSearchMessageQuery(e.target.value)}
            placeholder="Search messages in this chat..."
            className="w-full max-w-md px-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={onOpenProfile}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700"
              />
              {chat.isOnline && !chat.isBlocked && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 ring-1 ring-green-400"></div>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                {chat.name}
              </h2>
              {isTyping && !chat.isBlocked ? (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-primary font-medium">
                  <span>typing</span>
                  <TypingIndicator />
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {chat.isOnline && !chat.isBlocked ? 'Online' : (() => {
                    if (chat.isBlocked || !chat.lastSeen) return 'Offline';
                    try {
                      const date = new Date(chat.lastSeen);
                      if (isNaN(date.getTime())) return 'Offline';
                      const now = new Date();
                      
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      
                      if (compareDate.getTime() === today.getTime()) {
                        return `last seen today at ${timeString}`;
                      } else if (compareDate.getTime() === yesterday.getTime()) {
                        return `last seen yesterday at ${timeString}`;
                      } else {
                        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return `last seen on ${dateStr} at ${timeString}`;
                      }
                    } catch (e) {
                      return 'Offline';
                    }
                  })()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!showMessageSearch && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMessageSearch(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Search size={18} className="text-gray-600 dark:text-gray-400" />
          </motion.button>
        )}

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-20 w-44 border border-gray-100 dark:border-gray-650"
            >
              <button 
                onClick={() => {
                  onOpenProfile();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-xs text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold"
              >
                View Contact
              </button>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-2 text-left text-xs text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold"
              >
                Mute Notifications
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
