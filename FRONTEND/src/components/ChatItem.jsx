import { motion } from 'framer-motion';

const ChatItem = ({ chat, isActive, onClick }) => {
  const unreadCount = chat.unread || chat.unreadCount || 0;

  const formatChatTime = (time) => {
    if (!time) return '';
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (compareDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      } else if (now - date < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  };

  const displayTime = formatChatTime(chat.lastMessageTime || chat.timestamp);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`p-3 cursor-pointer transition-all rounded-xl mb-1.5 border-l-4 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 border-primary shadow-sm font-medium'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar Container */}
        <div className="relative flex-shrink-0 mt-0.5">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700"
          />
          {chat.isOnline && !chat.isBlocked && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 ring-1 ring-green-400"></span>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{chat.name}</span>
              {chat.isBlocked && (
                <span className="text-[9px] bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-100 dark:border-red-950/30 rounded px-1.5 py-0.5 font-bold select-none">
                  Blocked
                </span>
              )}
            </h3>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 font-medium">
              {displayTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2 flex-1">
              {chat.lastMessage}
            </p>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold shadow-sm"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
