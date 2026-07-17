import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const ProfileModal = ({ chat, onClose }) => {
  if (!chat) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
          />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {chat.name}
          </h3>
          <p className={`text-sm ${chat.isOnline ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
            {chat.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mb-1">
              EMAIL
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {chat.name.toLowerCase().replace(' ', '.')}@example.com
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mb-1">
              PHONE
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              +1 (555) 000-0000
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mb-1">
              STATUS
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {chat.isOnline ? '🟢 Active' : '⚫ Away'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
            Message
          </button>
          <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold">
            Block
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;
