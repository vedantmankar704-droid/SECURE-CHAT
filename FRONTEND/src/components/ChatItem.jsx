import { motion } from 'framer-motion';

const ChatItem = ({ chat, isActive, onClick }) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      onClick={onClick}
      className={`p-3 cursor-pointer transition-all rounded-lg mb-2 ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {chat.name}
            </h3>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
              {chat.timestamp}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {chat.lastMessage}
            </p>
            {chat.unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-semibold"
              >
                {chat.unread > 9 ? '9+' : chat.unread}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
