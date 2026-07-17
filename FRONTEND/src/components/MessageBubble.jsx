import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwnMessage }) => {
  const bubbleVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-xs`}>
        {!isOwnMessage && message.avatar && (
          <img
            src={message.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex flex-col">
          <div
            className={`message-bubble ${isOwnMessage ? 'outgoing' : 'incoming'}`}
          >
            {message.image ? (
              <img
                src={message.image}
                alt="Message image"
                className="rounded-2xl max-w-sm"
              />
            ) : message.file ? (
              <div className="flex items-center gap-2">
                <div className="bg-gray-300 dark:bg-gray-600 w-8 h-8 rounded flex items-center justify-center">
                  📎
                </div>
                <span className="text-sm text-gray-900 dark:text-white">{message.file}</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-white">{message.content}</p>
            )}
          </div>
          <div className={`flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>{message.timestamp}</span>
            {isOwnMessage && (
              message.read ? <CheckCheck size={14} className="text-gray-600 dark:text-gray-400" /> : <Check size={14} className="text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
