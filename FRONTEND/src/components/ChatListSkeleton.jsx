import { motion } from 'framer-motion';

const ChatListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/60 dark:bg-gray-800/40 animate-pulse border border-gray-100 dark:border-gray-800"
        >
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-gray-300 dark:bg-gray-700 rounded-full w-28" />
              <div className="h-2.5 bg-gray-200 dark:bg-gray-750 rounded-full w-10" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ChatListSkeleton;
