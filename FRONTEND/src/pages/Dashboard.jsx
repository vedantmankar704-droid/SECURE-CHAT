import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import EmptyChat from '../components/EmptyChat';
import ProfileModal from '../components/ProfileModal';
import TypingIndicator from '../components/TypingIndicator';
import socket from '../socket/socket';
import { useAppStore } from '../store/appStore';

const Dashboard = ({ onNavigate, darkMode, onToggleDarkMode }) => {
  const { currentUser } = useAppStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lightboxUrl, setLightboxUrl] = useState('');

  const ourId = currentUser?.id || currentUser?._id;

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const normalizedUsers = data.users.map(u => ({
            id: u._id,
            name: u.name,
            username: u.username,
            avatar: u.avatar || 'https://i.pravatar.cc/150?img=10',
            isOnline: false,
            lastMessage: 'Click to start chatting',
            timestamp: '',
            lastSeen: u.lastSeen
          }));
          setChats(normalizedUsers);
        }
      } catch (err) {
        console.error('Fetch users failed:', err);
      }
    };

    fetchUsers();
  }, []);

  // Socket.io integration
  useEffect(() => {
    if (!currentUser || !ourId) return;

    // Join socket room
    socket.emit('join', ourId);

    // Online Status handlers
    const handleGetOnlineUsers = (users) => {
      console.log('Online users array updated:', users);
      setOnlineUsers(users);
    };

    const handleUserOnline = ({ userId }) => {
      console.log('User came online:', userId);
      setChats(prev => prev.map(c => c.id === userId ? { ...c, isOnline: true } : c));
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
      console.log('User went offline:', userId, lastSeen);
      setChats(prev => prev.map(c => c.id === userId ? { ...c, isOnline: false, lastSeen } : c));
    };

    // Message status confirm handlers
    const handleMessageStatusUpdated = ({ messageId, status }) => {
      console.log('Message status updated via socket:', messageId, status);
      if (selectedChat) {
        setMessages(prev => {
          const chatMsgs = prev[selectedChat.id] || [];
          const updated = chatMsgs.map(msg => 
            (msg.id === messageId || msg._id === messageId) ? { ...msg, status } : msg
          );
          return { ...prev, [selectedChat.id]: updated };
        });
      }
    };

    const handleMessagesSeen = ({ senderId }) => {
      console.log('Messages marked as seen by recipient:', senderId);
      if (selectedChat && selectedChat.id === senderId) {
        setMessages(prev => {
          const chatMsgs = prev[selectedChat.id] || [];
          const updated = chatMsgs.map(msg => 
            msg.isOwn ? { ...msg, status: 'seen', read: true } : msg
          );
          return { ...prev, [selectedChat.id]: updated };
        });
      }
    };

    // Emoji reaction update handlers
    const handleReactionAdded = ({ messageId, userId, emoji }) => {
      console.log('Reaction added via socket:', messageId, userId, emoji);
      if (selectedChat) {
        setMessages(prev => {
          const chatMsgs = prev[selectedChat.id] || [];
          const updated = chatMsgs.map(msg => {
            if (msg.id === messageId || msg._id === messageId) {
              const reactions = [...(msg.reactions || [])];
              const idx = reactions.findIndex(r => r.userId?.toString() === userId);
              if (idx > -1) {
                reactions[idx].emoji = emoji;
              } else {
                reactions.push({ userId, emoji });
              }
              return { ...msg, reactions };
            }
            return msg;
          });
          return { ...prev, [selectedChat.id]: updated };
        });
      }
    };

    const handleReactionRemoved = ({ messageId, userId }) => {
      console.log('Reaction removed via socket:', messageId, userId);
      if (selectedChat) {
        setMessages(prev => {
          const chatMsgs = prev[selectedChat.id] || [];
          const updated = chatMsgs.map(msg => {
            if (msg.id === messageId || msg._id === messageId) {
              const reactions = (msg.reactions || []).filter(r => r.userId?.toString() !== userId);
              return { ...msg, reactions };
            }
            return msg;
          });
          return { ...prev, [selectedChat.id]: updated };
        });
      }
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      console.log('Generic reaction update received:', messageId, reactions);
      if (selectedChat) {
        setMessages(prev => {
          const chatMsgs = prev[selectedChat.id] || [];
          const updated = chatMsgs.map(msg => 
            (msg.id === messageId || msg._id === messageId) ? { ...msg, reactions } : msg
          );
          return { ...prev, [selectedChat.id]: updated };
        });
      }
    };

    // Receive message handler
    const handleReceiveMessage = (data) => {
      console.log('Real-time message received via socket:', data);
      const { sender, receiver, content, messageType, imageUrl, fileUrl, fileName, fileSize, _id, createdAt, status, reactions } = data || {};
      
      if (receiver !== ourId) return;

      const partnerId = sender;

      const newIncomingMessage = {
        id: _id || Date.now() + Math.random(),
        _id: _id,
        sender: 'Other',
        content,
        timestamp: new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        read: status === 'seen',
        avatar: '',
        messageType,
        imageUrl,
        fileUrl,
        fileName,
        fileSize,
        status: status || 'delivered',
        reactions: reactions || []
      };

      setMessages(prev => {
        const chatMsgs = prev[partnerId] || [];
        return {
          ...prev,
          [partnerId]: [...chatMsgs, newIncomingMessage]
        };
      });

      // Mark seen immediately if active conversation panel is open
      if (selectedChat && selectedChat.id === partnerId) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:5000/api/messages/seen/${partnerId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.error("Real-time seen update failed:", err));
      }

      // Update last message preview in sidebar
      let previewText = "Sent an attachment";
      if (messageType === 'text' || !messageType) {
        previewText = content;
      } else if (messageType === 'image') {
        previewText = "📷 Image";
      } else if (messageType === 'file') {
        previewText = `📄 ${fileName || "Document"}`;
      }

      setChats(prevChats => prevChats.map(c => 
        c.id === partnerId 
          ? { ...c, lastMessage: previewText, timestamp: new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          : c
      ));
    };

    // Typing Event handlers
    const handleTypingEvent = ({ senderId }) => {
      if (selectedChat && selectedChat.id === senderId) {
        setIsTyping(true);
      }
    };

    const handleStopTypingEvent = ({ senderId }) => {
      if (selectedChat && selectedChat.id === senderId) {
        setIsTyping(false);
      }
    };

    // Socket registers
    socket.on('getOnlineUsers', handleGetOnlineUsers);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageStatusUpdated', handleMessageStatusUpdated);
    socket.on('messageDelivered', handleMessageStatusUpdated);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('messageSeen', handleMessagesSeen);
    socket.on('reactionAdded', handleReactionAdded);
    socket.on('reactionRemoved', handleReactionRemoved);
    socket.on('reactionUpdated', handleReactionUpdated);
    socket.on('typing', handleTypingEvent);
    socket.on('stopTyping', handleStopTypingEvent);

    return () => {
      socket.off('getOnlineUsers', handleGetOnlineUsers);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageStatusUpdated', handleMessageStatusUpdated);
      socket.off('messageDelivered', handleMessageStatusUpdated);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('messageSeen', handleMessagesSeen);
      socket.off('reactionAdded', handleReactionAdded);
      socket.off('reactionRemoved', handleReactionRemoved);
      socket.off('reactionUpdated', handleReactionUpdated);
      socket.off('typing', handleTypingEvent);
      socket.off('stopTyping', handleStopTypingEvent);
    };
  }, [currentUser, ourId, selectedChat]);

  // Fetch conversation history and trigger 'seen' status update when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/messages/${selectedChat.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const normalizedMessages = data.messages.map(msg => ({
            id: msg._id,
            _id: msg._id,
            sender: msg.sender === ourId ? 'You' : selectedChat.name,
            content: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isOwn: msg.sender === ourId,
            read: msg.status === 'seen',
            avatar: msg.sender === ourId ? currentUser?.avatar : selectedChat.avatar,
            messageType: msg.messageType,
            imageUrl: msg.imageUrl,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            status: msg.status,
            reactions: msg.reactions || []
          }));

          setMessages(prev => ({
            ...prev,
            [selectedChat.id]: normalizedMessages
          }));

          // Mark incoming unread conversation logs as seen
          fetch(`http://localhost:5000/api/messages/seen/${selectedChat.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch(err => console.error("Seen updates sync failed:", err));
        }
      } catch (err) {
        console.error('Fetch conversation history failed:', err);
      }
    };

    fetchHistory();
  }, [selectedChat, currentUser, ourId]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // Reset typing state on panel transition
  useEffect(() => {
    setIsTyping(false);
  }, [selectedChat]);

  const handleTyping = () => {
    if (!selectedChat || !ourId) return;
    socket.emit('typing', { senderId: ourId, receiverId: selectedChat.id });
  };

  const handleStopTyping = () => {
    if (!selectedChat || !ourId) return;
    socket.emit('stopTyping', { senderId: ourId, receiverId: selectedChat.id });
  };

  // Toggle emoji reactions
  const handleReact = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (selectedChat) {
          setMessages(prev => {
            const chatMsgs = prev[selectedChat.id] || [];
            const updated = chatMsgs.map(msg => 
              (msg.id === messageId || msg._id === messageId) ? { ...msg, reactions: data.reactions } : msg
            );
            return { ...prev, [selectedChat.id]: updated };
          });
        }
      }
    } catch (err) {
      console.error('Toggle reaction failed:', err);
    }
  };

  const handleSendMessage = async (content, attachment = null) => {
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const messageBody = {
        receiverId: selectedChat.id,
        content: content || ""
      };

      if (attachment) {
        messageBody.messageType = attachment.type;
        messageBody.imageUrl = attachment.type === 'image' ? attachment.url : '';
        messageBody.fileUrl = attachment.type === 'file' ? attachment.url : '';
        messageBody.fileName = attachment.name;
        messageBody.fileSize = attachment.size;
      }

      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageBody)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const savedMsg = data.message;

        // Broadcast via Socket.io
        const socketPayload = {
          _id: savedMsg._id,
          senderId: ourId,
          receiverId: selectedChat.id,
          content: savedMsg.content,
          messageType: savedMsg.messageType,
          imageUrl: savedMsg.imageUrl,
          fileUrl: savedMsg.fileUrl,
          fileName: savedMsg.fileName,
          fileSize: savedMsg.fileSize,
          createdAt: savedMsg.createdAt
        };
        socket.emit('sendMessage', socketPayload);

        // Append locally in history log
        const localMsg = {
          id: savedMsg._id,
          _id: savedMsg._id,
          sender: 'You',
          content: savedMsg.content,
          timestamp: new Date(savedMsg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          read: savedMsg.status === 'seen',
          avatar: currentUser?.avatar,
          messageType: savedMsg.messageType,
          imageUrl: savedMsg.imageUrl,
          fileUrl: savedMsg.fileUrl,
          fileName: savedMsg.fileName,
          fileSize: savedMsg.fileSize,
          status: savedMsg.status,
          reactions: []
        };

        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), localMsg]
        }));

        // Format sidebar message preview
        let previewText = "Sent an attachment";
        if (savedMsg.messageType === 'text' || !savedMsg.messageType) {
          previewText = content;
        } else if (savedMsg.messageType === 'image') {
          previewText = "📷 Image";
        } else if (savedMsg.messageType === 'file') {
          previewText = `📄 ${savedMsg.fileName || "Document"}`;
        }

        setChats(prevChats => prevChats.map(c => 
          c.id === selectedChat.id 
            ? { ...c, lastMessage: previewText, timestamp: new Date(savedMsg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
            : c
        ));
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  // Map online statuses dynamically
  const chatsWithOnlineStatus = chats.map(chat => ({
    ...chat,
    isOnline: onlineUsers.includes(chat.id)
  }));

  const currentMessages = selectedChat ? (messages[selectedChat.id] || []) : [];

  return (
    <div className={`h-screen flex bg-white dark:bg-darkBg overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Photo Lightbox Dialog */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl('')}
            className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxUrl('')}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={lightboxUrl}
              alt="Enlarged media"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

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
          chats={chatsWithOnlineStatus}
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
                chat={{ 
                  ...selectedChat, 
                  isOnline: onlineUsers.includes(selectedChat.id),
                  lastSeen: chats.find(c => c.id === selectedChat.id)?.lastSeen
                }}
                isTyping={isTyping}
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
                          key={msg.id || index}
                          message={msg}
                          isOwnMessage={msg.isOwn}
                          onReact={handleReact}
                          onImageClick={setLightboxUrl}
                          currentUserId={ourId}
                        />
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
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
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>

              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
              />
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
            chat={{
              ...selectedChat,
              isOnline: onlineUsers.includes(selectedChat.id),
              lastSeen: chats.find(c => c.id === selectedChat.id)?.lastSeen
            }}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
