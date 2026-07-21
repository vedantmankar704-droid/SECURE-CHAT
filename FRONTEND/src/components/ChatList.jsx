import { motion } from 'framer-motion';
import ChatItem from './ChatItem';
import ChatListSkeleton from './ChatListSkeleton';

const ChatList = ({ chats, activeChat, onSelectChat, searchQuery, isLoading }) => {
  if (isLoading) {
    return <ChatListSkeleton count={6} />;
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex-1 overflow-y-auto px-2"
    >
      {filteredChats.length > 0 ? (
        filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={activeChat?.id === chat.id}
            onClick={() => onSelectChat(chat)}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <p className="text-gray-700 dark:text-gray-300">No conversations found</p>
        </div>
      )}
    </motion.div>
  );
};

export default ChatList;
