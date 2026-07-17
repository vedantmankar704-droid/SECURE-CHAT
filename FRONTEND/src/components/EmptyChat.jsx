import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const EmptyChat = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full bg-white dark:bg-darkBg"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <MessageCircle
          size={80}
          className="text-gray-300 dark:text-gray-600 mb-4"
        />
      </motion.div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Select a conversation
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-center">
        Choose a chat from the list to start messaging
      </p>
    </motion.div>
  );
};

export default EmptyChat;
