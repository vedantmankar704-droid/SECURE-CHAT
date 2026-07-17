import { motion } from 'framer-motion';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';

const MessageBubble = ({ message, isOwnMessage, onReact, onImageClick, currentUserId }) => {
  const bubbleVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  // Aggregate reactions by emoji
  const reactionGroups = (message.reactions || []).reduce((acc, current) => {
    const emoji = current.emoji;
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  // Format file size helper
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Determine user's active reaction
  const userReaction = (message.reactions || []).find(
    r => (r.userId?.toString() === currentUserId || r.userId?._id?.toString() === currentUserId)
  );

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group relative`}
    >
      {/* Quick Reaction Bar on Hover (Desktop) */}
      <div className={`absolute -top-7 ${isOwnMessage ? 'right-2' : 'left-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-full px-2 py-0.5 z-20`}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(message.id || message._id, emoji)}
            className={`text-sm hover:scale-125 transition-transform p-0.5 active:scale-95 ${userReaction?.emoji === emoji ? 'bg-indigo-50 dark:bg-indigo-900/30 rounded-full' : ''}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className={`flex gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-xs sm:max-w-md`}>
        {/* Avatar */}
        {!isOwnMessage && message.avatar && (
          <img
            src={message.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm"
          />
        )}

        <div className="flex flex-col">
          {/* Main Message Bubble */}
          <div
            className={`message-bubble overflow-hidden ${isOwnMessage ? 'outgoing' : 'incoming'} transition-shadow hover:shadow-md`}
          >
            {message.messageType === 'image' || message.imageUrl ? (
              <div className="flex flex-col gap-2">
                <img
                  src={message.imageUrl || message.image}
                  alt="Message Shared"
                  onClick={() => onImageClick && onImageClick(message.imageUrl || message.image)}
                  className="rounded-2xl max-w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity max-h-60 object-cover"
                />
                {message.content && (
                  <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-white px-1">
                    {message.content}
                  </p>
                )}
              </div>
            ) : message.messageType === 'file' || message.fileUrl ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 bg-gray-100/80 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
                      {message.fileName || message.file || 'attachment'}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatSize(message.fileSize)}
                    </p>
                  </div>
                  <a
                    href={message.fileUrl || message.file}
                    download={message.fileName || 'file'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-full flex-shrink-0"
                  >
                    <Download size={16} />
                  </a>
                </div>
                {message.content && (
                  <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-white px-1">
                    {message.content}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-white">
                {message.content}
              </p>
            )}
          </div>

          {/* Time & Double Checks Status indicators */}
          <div className={`flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>{message.timestamp}</span>
            {isOwnMessage && (
              <span>
                {message.status === 'seen' ? (
                  <CheckCheck size={13} className="text-blue-500" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck size={13} className="text-gray-400 dark:text-gray-500" />
                ) : (
                  <Check size={13} className="text-gray-400 dark:text-gray-500" />
                )}
              </span>
            )}
          </div>

          {/* Reactions Sub-container */}
          {Object.keys(reactionGroups).length > 0 && (
            <div
              onClick={() => onReact(message.id || message._id, userReaction ? userReaction.emoji : '❤️')}
              className={`flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 shadow-sm rounded-full px-2 py-0.5 mt-1 text-[11px] self-${isOwnMessage ? 'end' : 'start'} cursor-pointer select-none active:scale-95 transition-transform`}
            >
              {Object.entries(reactionGroups).map(([emoji, count]) => (
                <span key={emoji} className="flex items-center gap-0.5">
                  {emoji} <span className="text-[9px] text-gray-500 font-bold">{count > 1 ? count : ''}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
