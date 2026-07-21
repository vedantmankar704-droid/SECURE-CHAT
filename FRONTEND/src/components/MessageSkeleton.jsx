import { motion } from 'framer-motion';

const MessageSkeleton = ({ count = 6 }) => {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {Array.from({ length: count }).map((_, idx) => {
        const isOwn = idx % 2 === 1;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            {!isOwn && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            )}
            <div
              className={`p-4 rounded-2xl animate-pulse space-y-2 max-w-[70%] ${
                isOwn
                  ? 'bg-primary/20 dark:bg-primary/30 rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
              }`}
              style={{ width: `${Math.floor(Math.random() * 40) + 30}%` }}
            >
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-full" />
              {idx % 3 === 0 && (
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
