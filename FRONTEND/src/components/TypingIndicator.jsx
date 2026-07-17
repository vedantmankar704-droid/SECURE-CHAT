import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="typing-dot w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
      <div className="typing-dot w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
      <div className="typing-dot w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
    </div>
  );
};

export default TypingIndicator;
