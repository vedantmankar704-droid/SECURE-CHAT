import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Info, ShieldAlert, Ban, MessageSquare } from 'lucide-react';

const ProfileModal = ({ chat, onClose, onMessage, onToggleBlock }) => {
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!chat) return null;

  const isBlocked = chat.isBlocked;

  const handleBlockUnblock = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isBlocked ? 'unblock' : 'block';
      const res = await fetch(`http://localhost:5000/api/users/${endpoint}/${chat.id || chat._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onToggleBlock) {
          onToggleBlock(chat.id || chat._id, !isBlocked);
        }
        setShowBlockConfirm(false);
      }
    } catch (err) {
      console.error("Block/Unblock failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessageClick = () => {
    if (onMessage) {
      onMessage(chat);
    }
    onClose();
  };

  // Format last seen timestamp helper
  const formatLastSeen = (dateStr) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    return `Last seen ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/35 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden relative"
      >
        {/* Top Header Controls */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-1.5 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors cursor-pointer text-gray-800 dark:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Profile Banner Header */}
        <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 py-8 px-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700/50">
          <div className="relative mb-4">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-gray-800"
            />
            {chat.isOnline && !chat.isBlocked && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
            {chat.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{chat.username}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium bg-white dark:bg-gray-750 px-2.5 py-1 rounded-full border border-gray-150 dark:border-gray-700 select-none">
            {chat.isBlocked ? 'Blocked' : chat.isOnline ? '🟢 Active Now' : `⚫ ${formatLastSeen(chat.lastSeen)}`}
          </p>
        </div>

        {/* Content details body */}
        <div className="p-5 space-y-4 font-sans">
          
          {/* Email */}
          <div className="flex items-start gap-3 text-left">
            <Mail size={16} className="text-gray-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-gray-400 tracking-wider mb-0.5 select-none uppercase">
                Email
              </p>
              <p className="text-xs text-gray-800 dark:text-gray-200 truncate font-medium">
                {chat.email || `${chat.username}@example.com`}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 text-left">
            <Phone size={16} className="text-gray-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-gray-400 tracking-wider mb-0.5 select-none uppercase">
                Phone
              </p>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                {chat.phone || 'No phone provided'}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start gap-3 text-left">
            <Info size={16} className="text-gray-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-gray-400 tracking-wider mb-0.5 select-none uppercase">
                Bio / About
              </p>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                {chat.bio || 'Hello, I am using Secure Chat!'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700/50 flex gap-3">
          <button 
            onClick={handleMessageClick}
            className="flex-1 py-2.5 bg-primary hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-200 dark:shadow-none"
          >
            <MessageSquare size={14} />
            <span>Message</span>
          </button>
          
          <button 
            onClick={() => {
              if (isBlocked) {
                handleBlockUnblock(); // Unblock directly
              } else {
                setShowBlockConfirm(true); // Show confirmation for block
              }
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isBlocked
                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30'
                : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-700/30'
            }`}
          >
            <Ban size={14} />
            <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
          </button>
        </div>

        {/* Block Confirmation Dialog Overlay */}
        <AnimatePresence>
          {showBlockConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-20"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 max-w-[280px] w-full shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-3">
                  <ShieldAlert size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                  Block this user?
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-center">
                  You will no longer receive messages from this user.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    disabled={isProcessing}
                    onClick={handleBlockUnblock}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    <span>Block User</span>
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => setShowBlockConfirm(false)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-850 dark:text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;
