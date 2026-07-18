import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, FileText, Download, MoreHorizontal, CornerUpLeft, ArrowRight, Trash2, Ban } from 'lucide-react';
import { decryptFile } from '../services/encryptionService';

const EncryptedImage = ({ src, aesKey, iv, alt, className, onClick }) => {
  const [decryptedUrl, setDecryptedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src || !aesKey || !iv) {
      setDecryptedUrl(src);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadAndDecrypt = async () => {
      try {
        const res = await fetch(src);
        const encryptedBuffer = await res.arrayBuffer();
        const decryptedBuffer = await decryptFile(encryptedBuffer, aesKey, iv);
        
        // Determine file type/mime from filename if possible, or default to image/jpeg
        const blob = new Blob([decryptedBuffer], { type: 'image/jpeg' });
        const localUrl = URL.createObjectURL(blob);
        
        if (isMounted) {
          setDecryptedUrl(localUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to decrypt image file:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAndDecrypt();

    return () => {
      isMounted = false;
      if (decryptedUrl && decryptedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [src, aesKey, iv]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse`}>
        <span className="text-[10px] text-gray-400">Decrypting...</span>
      </div>
    );
  }

  return (
    <img
      src={decryptedUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
};

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  onReact, 
  onImageClick, 
  currentUserId,
  onReply,
  onForward,
  onDelete,
  searchQuery,
  scrollToMessage
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const triggerRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, transformOrigin: 'top right' });

  const bubbleVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25 }
  };

  const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  const handleDownloadFile = async (e) => {
    e.preventDefault();
    if (!message.fileAesKey || !message.fileIv) return;
    try {
      const res = await fetch(message.fileUrl);
      const encryptedBuffer = await res.arrayBuffer();
      const decryptedBuffer = await decryptFile(encryptedBuffer, message.fileAesKey, message.fileIv);
      
      const blob = new Blob([decryptedBuffer], { type: 'application/octet-stream' });
      const localUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = message.fileName || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.error("File decryption download failed:", err);
      alert("Failed to decrypt and download file.");
    }
  };

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

  // Search highlighting helper
  const renderHighlightedContent = (text, query) => {
    if (!text) return '';
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-250 dark:bg-yellow-850 text-black px-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Auto-close actions menu on scroll to prevent layout drift
  useEffect(() => {
    if (showActionsMenu) {
      const handleScroll = () => setShowActionsMenu(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [showActionsMenu]);

  // Compute smart viewport coordinates on menu open
  const handleOpenMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    const menuWidth = 176;
    const menuHeight = 180; // Approximated max height of the menu

    let top = rect.bottom + 6;
    let left = isOwnMessage ? (rect.right - menuWidth) : rect.left;
    let originY = 'top';
    let originX = isOwnMessage ? 'right' : 'left';

    // 1. Vertical Space Check
    if (rect.bottom + menuHeight > window.innerHeight - 20) {
      top = rect.top - menuHeight - 6;
      originY = 'bottom';
    }

    // 2. Horizontal Space Check
    if (left < 10) {
      left = 10;
      originX = 'left';
    } else if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
      originX = 'right';
    }

    // 3. Keep layout bounded within safe viewport vertical margins
    top = Math.max(10, Math.min(top, window.innerHeight - menuHeight - 10));

    setMenuCoords({
      top,
      left,
      transformOrigin: `${originY} ${originX}`
    });
    setShowActionsMenu(true);
  };

  return (
    <motion.div
      id={`msg-${message._id || message.id}`}
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-5 group relative`}
    >
      {/* Bubble body content */}
      <div className={`flex gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-[78%] sm:max-w-[70%] md:max-w-[62%]`}>
        {/* Avatar */}
        {!isOwnMessage && message.avatar && (
          <img
            src={message.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm border border-gray-100 dark:border-gray-800"
          />
        )}

        <div className="flex flex-col">
          {/* Overlapping badge wrapper & hovered options wrapper */}
          <div className="relative flex items-center group/bubble">
            
            {/* Options Menu Trigger on Hover */}
            {!(message.isDeleted || message.deletedForEveryone) && (
              <button
                ref={triggerRef}
                type="button"
                onClick={handleOpenMenu}
                className={`absolute ${isOwnMessage ? 'left-[-32px]' : 'right-[-32px]'} top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 focus:opacity-100 transition-opacity duration-200 p-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 rounded-full shadow-md border border-gray-200 dark:border-gray-700 z-20 cursor-pointer`}
              >
                <MoreHorizontal size={14} />
              </button>
            )}

            {/* Dropdown Action Menu */}
            <AnimatePresence>
              {showActionsMenu && (
                <>
                  {/* Backdrop for click outside */}
                  <div 
                    className="fixed inset-0 z-45 cursor-default" 
                    onClick={() => setShowActionsMenu(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'fixed',
                      top: `${menuCoords.top}px`,
                      left: `${menuCoords.left}px`,
                      transformOrigin: menuCoords.transformOrigin,
                      width: '176px'
                    }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-2xl shadow-xl p-2 z-50 font-sans text-left"
                  >
                    {/* Emoji Reaction Row (React with Emoji) */}
                    <div className="flex items-center justify-between px-1 py-1 border-b border-gray-100 dark:border-gray-700/60 mb-1.5">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            if (onReact) onReact(message.id || message._id, emoji);
                            setShowActionsMenu(false);
                          }}
                          className={`text-base hover:scale-130 transition-transform p-0.5 active:scale-95 ${userReaction?.emoji === emoji ? 'bg-indigo-50 dark:bg-indigo-900/30 rounded-full' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Action list */}
                    <button
                      onClick={() => {
                        if (onReply) onReply(message);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <CornerUpLeft size={13} className="text-gray-500" /> Reply
                    </button>
                    <button
                      onClick={() => {
                        if (onForward) onForward(message);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs font-semibold text-gray-755 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowRight size={13} className="text-gray-500" /> Forward
                    </button>
                    <button
                      onClick={() => {
                        if (onDelete) onDelete(message);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div
              className={`message-bubble overflow-hidden transition-all hover:shadow-md ${
                (message.isDeleted || message.deletedForEveryone)
                  ? 'bg-gray-100/60 dark:bg-gray-800/65 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/35'
                  : isOwnMessage
                    ? 'outgoing'
                    : 'incoming'
              } ${
                !(message.isDeleted || message.deletedForEveryone) && (message.messageType === 'image' || message.imageUrl) && !message.content ? '!p-0' : 'p-3'
              }`}
            >
              {/* Forwarded Tag */}
              {message.isForwarded && !(message.isDeleted || message.deletedForEveryone) && (
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-1 select-none font-medium italic opacity-95">
                  <span className="scale-x-[-1] inline-block font-sans">↪</span>
                  <span>Forwarded</span>
                </div>
              )}

              {/* Replied Message Preview Box */}
              {message.replyTo && !(message.isDeleted || message.deletedForEveryone) && (
                <div 
                  onClick={() => scrollToMessage && scrollToMessage(message.replyTo._id || message.replyTo.id)}
                  className={`mb-2 p-2 border-l-4 border-primary rounded text-xs select-none text-left opacity-90 max-w-full cursor-pointer hover:opacity-100 transition-opacity ${
                    isOwnMessage ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-850 dark:text-gray-200'
                  }`}
                >
                  <p className={`font-bold text-[11px] mb-0.5 truncate ${isOwnMessage ? 'text-blue-100' : 'text-primary'}`}>
                    {message.replyTo.sender?.name || (message.replyTo.sender === currentUserId ? 'You' : 'Recipient')}
                  </p>
                  <p className="truncate opacity-80">
                    {message.replyTo.messageType === 'image' ? '📷 Image' : message.replyTo.messageType === 'file' ? `📄 ${message.replyTo.fileName}` : message.replyTo.content}
                  </p>
                </div>
              )}

              {(message.isDeleted || message.deletedForEveryone) ? (
                <div className="flex items-center gap-1.5 select-none opacity-80 py-0.5">
                  <Ban size={14} className="text-gray-400 dark:text-gray-550 flex-shrink-0" />
                  <span className="text-xs italic font-medium leading-none">
                    {isOwnMessage ? 'You deleted this message' : 'This message was deleted'}
                  </span>
                </div>
              ) : message.messageType === 'image' || message.imageUrl ? (
                <div className="flex flex-col gap-2">
                  {message.fileAesKey ? (
                    <EncryptedImage
                      src={message.imageUrl}
                      aesKey={message.fileAesKey}
                      iv={message.fileIv}
                      alt="Message Shared"
                      onClick={() => onImageClick && onImageClick(message.imageUrl)}
                      className="rounded-xl max-w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity max-h-64 object-cover"
                    />
                  ) : (
                    <img
                      src={message.imageUrl || message.image}
                      alt="Message Shared"
                      onClick={() => onImageClick && onImageClick(message.imageUrl || message.image)}
                      className="rounded-xl max-w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity max-h-64 object-cover"
                    />
                  )}
                  {message.content && (
                    <p className="text-sm leading-relaxed break-words px-1">
                      {renderHighlightedContent(message.content, searchQuery)}
                    </p>
                  )}
                </div>
              ) : message.messageType === 'file' || message.fileUrl ? (
                <div className="flex flex-col gap-2">
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                    isOwnMessage 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-gray-100/80 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isOwnMessage ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isOwnMessage ? 'text-white' : 'text-gray-955 dark:text-white'}`}>
                        {message.fileName || message.file || 'attachment'}
                      </p>
                      <p className={`text-[10px] ${isOwnMessage ? 'text-blue-150' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatSize(message.fileSize)}
                      </p>
                    </div>
                    {message.fileAesKey ? (
                      <button
                        type="button"
                        onClick={handleDownloadFile}
                        className={`p-1.5 rounded-full flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${
                          isOwnMessage ? 'text-white' : 'text-gray-655 dark:text-gray-400'
                        }`}
                      >
                        <Download size={16} />
                      </button>
                    ) : (
                      <a
                        href={message.fileUrl || message.file}
                        download={message.fileName || 'file'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-full flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 ${
                          isOwnMessage ? 'text-white' : 'text-gray-655 dark:text-gray-400'
                        }`}
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                  {message.content && (
                    <p className="text-sm leading-relaxed break-words px-1">
                      {renderHighlightedContent(message.content, searchQuery)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed break-words">
                  {renderHighlightedContent(message.content, searchQuery)}
                </p>
              )}
            </div>

            {/* Reactions Overlap Badge */}
            <AnimatePresence>
              {Object.keys(reactionGroups).length > 0 && !(message.isDeleted || message.deletedForEveryone) && (
                <motion.div
                  layout
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  onClick={() => onReact && onReact(message.id || message._id, userReaction ? userReaction.emoji : '❤️')}
                  className={`absolute -bottom-2.5 ${isOwnMessage ? 'right-3' : 'left-3'} flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-full px-1.5 py-0.5 text-xs cursor-pointer select-none z-10 hover:scale-105 active:scale-95 transition-all`}
                >
                  {Object.entries(reactionGroups).map(([emoji, count]) => (
                    <motion.span 
                      key={emoji} 
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-0.5"
                    >
                      {emoji} 
                      {count > 1 && (
                        <span className="text-[9px] text-gray-500 font-bold ml-0.5">
                          {count}
                        </span>
                      )}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time & Double Checks Status indicators */}
          <div className={`flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-gray-400 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>{message.timestamp}</span>
            {isOwnMessage && !(message.isDeleted || message.deletedForEveryone) && (
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
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
