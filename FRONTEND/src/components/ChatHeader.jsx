import { motion } from 'framer-motion';
import { MoreVertical, Search, X } from 'lucide-react';
import { useState } from 'react';

const ChatHeader = ({ chat, onClose, onOpenProfile }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!chat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10"
    >
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
              className="w-10 h-10 rounded-full object-cover"
            />
            {chat.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              {chat.name}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {chat.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Search size={18} className="text-gray-700 dark:text-gray-300" />
        </motion.button>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreVertical size={18} className="text-gray-700 dark:text-gray-300" />
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-20"
            >
              <button className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                View Contact
              </button>
              <button className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                Mute Notifications
              </button>
              <button className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900">
                Delete Chat
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
