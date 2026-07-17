import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatsData } from '../data/chats';
import { messagesData } from '../data/messages';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import EmptyChat from '../components/EmptyChat';
import ProfileModal from '../components/ProfileModal';
import TypingIndicator from '../components/TypingIndicator';
import { Menu, X } from 'lucide-react';

const Dashboard = ({ onNavigate, darkMode, onToggleDarkMode }) => {
  const [chats, setChats] = useState(chatsData);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);

  // Initialize messages
  useEffect(() => {
    const initialMessages = {};
    chats.forEach(chat => {
      initialMessages[chat.id] = messagesData[chat.id] || [];
    });
    setMessages(initialMessages);
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = (content) => {
    if (!selectedChat) return;

    const newMessage = {
      id: (messages[selectedChat.id]?.length || 0) + 1,
      sender: 'You',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      read: false
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    // Simulate typing indicator and response
    setTimeout(() => {
      const responseMessage = {
        id: (messages[selectedChat.id]?.length || 0) + 2,
        sender: selectedChat.name,
        content: 'Thanks for the message! 😊',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        read: true,
        avatar: selectedChat.avatar
      };

      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...prev[selectedChat.id], responseMessage]
      }));
    }, 1500);
  };

  const currentMessages = selectedChat ? (messages[selectedChat.id] || []) : [];

  return (
    <div className={`h-screen flex bg-white dark:bg-darkBg overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-50 flex items-center justify-between h-16">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
          {selectedChat ? selectedChat.name : 'Message'}
        </h2>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          {isMobileSidebarOpen ? (
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
        />
      )}

      {/* Sidebar */}
      <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} md:flex md:flex-col w-full md:w-80 bg-white dark:bg-gray-800`}>
        <Sidebar
          chats={chats}
          activeChat={selectedChat}
          onSelectChat={setSelectedChat}
          onNavigate={onNavigate}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col h-full pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full bg-white dark:bg-darkBg"
            >
              {/* Chat Header */}
              <ChatHeader
                chat={selectedChat}
                onClose={() => setSelectedChat(null)}
                onOpenProfile={() => setShowProfileModal(true)}
              />

              {/* Messages */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  {currentMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Date Separator */}
                      <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-white dark:bg-gray-800 rounded-full">
                          Today
                        </span>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                      </div>

                      {currentMessages.map((msg, index) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwnMessage={msg.isOwn}
                        />
                      ))}

                      {/* Typing Indicator */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <img
                          src={selectedChat.avatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl rounded-tl-none px-4 py-3">
                          <TypingIndicator />
                        </div>
                      </motion.div>
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>

              {/* Message Input */}
              <MessageInput onSendMessage={handleSendMessage} />
            </motion.div>
          ) : (
            <EmptyChat />
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            chat={selectedChat}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
