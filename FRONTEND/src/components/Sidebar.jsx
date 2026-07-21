import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import SearchBar from './SearchBar';
import ChatList from './ChatList';
import { useAppStore } from '../store/appStore';

const Sidebar = ({ chats, activeChat, onSelectChat, onNavigate, darkMode, onToggleDarkMode, isMobileOpen, onCloseMobile, pendingRequestsCount = 0, isLoadingChats = false }) => {
  const { currentUser, updateCurrentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const unreadCount = chats.reduce((sum, chat) => sum + (chat.unread || chat.unreadCount || 0), 0);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed md:relative md:w-full h-screen bg-white dark:bg-darkSideBar border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 md:z-0 ${
        isMobileOpen ? 'w-80' : 'w-0 md:w-full'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Message
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('requests')}
              title="Find Friends & Requests"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
            >
              <UserPlus size={20} className="text-gray-700 dark:text-gray-300" />
              {pendingRequestsCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full"></span>
              )}
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
              >
                <div className="w-5 h-5 flex flex-col gap-1">
                  <span className="block w-full h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                  <span className="block w-full h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                  <span className="block w-full h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                </div>
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-50 w-48"
                >
                  <button
                    onClick={() => {
                      onNavigate('requests');
                      setShowMenu(false);
                      onCloseMobile();
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><UserPlus size={16} /> Friend Requests</span>
                    {pendingRequestsCount > 0 && (
                      <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowMenu(false);
                      onCloseMobile();
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowMenu(false);
                      onCloseMobile();
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={onToggleDarkMode}
                    className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      updateCurrentUser(null);
                      onNavigate('welcome');
                      setShowMenu(false);
                      onCloseMobile();
                    }}
                    className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5">
            All Chats
            {unreadCount > 0 && (
              <span className="bg-white text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Chat List */}
      <ChatList
        chats={chats}
        activeChat={activeChat}
        onSelectChat={(chat) => {
          onSelectChat(chat);
          onCloseMobile();
        }}
        searchQuery={searchQuery}
        isLoading={isLoadingChats}
      />
    </motion.div>
  );
};

export default Sidebar;
