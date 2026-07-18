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

  // Added States for Reply, Forward, Delete, Search features
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [deleteModalMsg, setDeleteModalMsg] = useState(null);

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
            lastMessage: u.lastMessage || 'Click to start chatting',
            timestamp: '',
            lastSeen: u.lastSeen,
            lastMessageTime: u.lastMessageTime,
            unread: u.unreadCount || 0
          })).sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          });
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

    // Message deleted handler
    const handleMessageDeleted = ({ messageId, senderId, receiverId }) => {
      console.log('Real-time message deleted via socket:', messageId);
      const partnerId = senderId === ourId ? receiverId : senderId;
      setMessages(prev => {
        const chatMsgs = prev[partnerId] || [];
        const updated = chatMsgs.map(m => 
          (m.id === messageId || m._id === messageId) 
            ? { ...m, isDeletedForEveryone: true, content: "This message was deleted", messageType: "text", imageUrl: "", fileUrl: "", fileName: "", fileSize: 0 }
            : m
        );
        return { ...prev, [partnerId]: updated };
      });

      setChats(prevChats => prevChats.map(c => 
        (c.id === partnerId || c._id === partnerId) 
          ? { ...c, lastMessage: "This message was deleted" }
          : c
      ));
    };

    // Receive message handler
    const handleReceiveMessage = (data) => {
      console.log('Real-time message received via socket:', data);
      const { sender, receiver, content, messageType, imageUrl, fileUrl, fileName, fileSize, _id, createdAt, status, reactions, replyTo, isForwarded } = data || {};
      
      if (receiver !== ourId) return;

      const partnerId = sender;
      const isCurrentChat = selectedChat && selectedChat.id === partnerId;

      const newIncomingMessage = {
        id: _id || Date.now() + Math.random(),
        _id: _id,
        sender: 'Other',
        content,
        timestamp: new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        read: isCurrentChat || status === 'seen',
        avatar: '',
        messageType,
        imageUrl,
        fileUrl,
        fileName,
        fileSize,
        status: isCurrentChat ? 'seen' : (status || 'delivered'),
        reactions: reactions || [],
        replyTo,
        isForwarded
      };

      setMessages(prev => {
        const chatMsgs = prev[partnerId] || [];
        return {
          ...prev,
          [partnerId]: [...chatMsgs, newIncomingMessage]
        };
      });

      // Mark seen immediately if active conversation panel is open
      if (isCurrentChat) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:5000/api/messages/seen/${partnerId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.error("Real-time seen update failed:", err));
      }

      // Update last message preview in sidebar and move it to the top!
      let previewText = "Sent an attachment";
      if (messageType === 'text' || !messageType) {
        previewText = content;
      } else if (messageType === 'image') {
        previewText = "📷 Image";
      } else if (messageType === 'file') {
        previewText = `📄 ${fileName || "Document"}`;
      }

      setChats(prevChats => {
        const updated = prevChats.map(c => 
          c.id === partnerId 
            ? { 
                ...c, 
                lastMessage: previewText, 
                lastMessageTime: createdAt, 
                unread: isCurrentChat ? 0 : (c.unread || 0) + 1 
              }
            : c
        );
        return [...updated].sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });
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
    socket.on('messageDeleted', handleMessageDeleted);
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
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('typing', handleTypingEvent);
      socket.off('stopTyping', handleStopTypingEvent);
    };
  }, [currentUser, ourId, selectedChat]);

  // Fetch conversation history and trigger 'seen' status update when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    // Reset unread badge count locally on chat selection
    setChats(prev => prev.map(c => c.id === selectedChat.id ? { ...c, unread: 0 } : c));

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
            reactions: msg.reactions || [],
            replyTo: msg.replyTo,
            isForwarded: msg.isForwarded,
            isDeletedForEveryone: msg.isDeletedForEveryone
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

  // Execute delete message
  const executeDeleteMessage = async (msg, deleteType) => {
    try {
      const token = localStorage.getItem('token');
      const msgId = msg._id || msg.id;
      const res = await fetch(`http://localhost:5000/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deleteType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (deleteType === 'everyone') {
          setMessages(prev => {
            const chatMsgs = prev[selectedChat.id] || [];
            const updated = chatMsgs.map(m => 
              (m.id === msgId || m._id === msgId) 
                ? { ...m, isDeletedForEveryone: true, content: "This message was deleted", messageType: "text", imageUrl: "", fileUrl: "", fileName: "", fileSize: 0 }
                : m
            );
            return { ...prev, [selectedChat.id]: updated };
          });

          setChats(prevChats => prevChats.map(c => 
            c.id === selectedChat.id ? { ...c, lastMessage: "This message was deleted" } : c
          ));
        } else {
          setMessages(prev => {
            const chatMsgs = prev[selectedChat.id] || [];
            const updated = chatMsgs.filter(m => m.id !== msgId && m._id !== msgId);
            return { ...prev, [selectedChat.id]: updated };
          });
        }
      }
    } catch (err) {
      console.error("Delete message failed:", err);
    } finally {
      setDeleteModalMsg(null);
    }
  };

  // Execute forward message
  const executeForwardMessage = async (targetChat, msg) => {
    try {
      const token = localStorage.getItem('token');
      const messageBody = {
        receiverId: targetChat.id,
        content: msg.content || "",
        isForwarded: true
      };

      if (msg.messageType === 'image' || msg.imageUrl) {
        messageBody.messageType = 'image';
        messageBody.imageUrl = msg.imageUrl;
      } else if (msg.messageType === 'file' || msg.fileUrl) {
        messageBody.messageType = 'file';
        messageBody.fileUrl = msg.fileUrl;
        messageBody.fileName = msg.fileName;
        messageBody.fileSize = msg.fileSize;
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

        // Broadcast via socket
        const socketPayload = {
          _id: savedMsg._id,
          senderId: ourId,
          receiverId: targetChat.id,
          content: savedMsg.content,
          messageType: savedMsg.messageType,
          imageUrl: savedMsg.imageUrl,
          fileUrl: savedMsg.fileUrl,
          fileName: savedMsg.fileName,
          fileSize: savedMsg.fileSize,
          createdAt: savedMsg.createdAt,
          isForwarded: true
        };
        socket.emit('sendMessage', socketPayload);

        if (selectedChat && selectedChat.id === targetChat.id) {
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
            reactions: [],
            isForwarded: true
          };

          setMessages(prev => ({
            ...prev,
            [targetChat.id]: [...(prev[targetChat.id] || []), localMsg]
          }));
        }

        let previewText = "Sent an attachment";
        if (savedMsg.messageType === 'text' || !savedMsg.messageType) {
          previewText = savedMsg.content;
        } else if (savedMsg.messageType === 'image') {
          previewText = "📷 Image";
        } else if (savedMsg.messageType === 'file') {
          previewText = `📄 ${savedMsg.fileName || "Document"}`;
        }

        setChats(prevChats => {
          const updated = prevChats.map(c => 
            c.id === targetChat.id 
              ? { 
                  ...c, 
                  lastMessage: `↪ ${previewText}`, 
                  lastMessageTime: savedMsg.createdAt,
                  timestamp: new Date(savedMsg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
              : c
          );
          return [...updated].sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          });
        });
      }
    } catch (err) {
      console.error("Forward message failed:", err);
    } finally {
      setShowForwardModal(false);
      setForwardingMessage(null);
    }
  };

  // Scroll to original message when clicking reply quotes
  const scrollToMessage = (msgId) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = element.querySelector('.message-bubble');
      if (bubble) {
        bubble.classList.add('ring-4', 'ring-yellow-300', 'dark:ring-yellow-800', 'scale-[1.02]', 'transition-all', 'duration-300');
        setTimeout(() => {
          bubble.classList.remove('ring-4', 'ring-yellow-300', 'dark:ring-yellow-800', 'scale-[1.02]');
        }, 1500);
      }
    }
  };

  const handleSendMessage = async (content, attachment = null, replyToId = null, isForwarded = false) => {
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const messageBody = {
        receiverId: selectedChat.id,
        content: content || "",
        replyTo: replyToId,
        isForwarded
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
          createdAt: savedMsg.createdAt,
          replyTo: savedMsg.replyTo,
          isForwarded: savedMsg.isForwarded
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
          reactions: [],
          replyTo: savedMsg.replyTo,
          isForwarded: savedMsg.isForwarded
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

        setChats(prevChats => {
          const updated = prevChats.map(c => 
            c.id === selectedChat.id 
              ? { 
                  ...c, 
                  lastMessage: previewText, 
                  lastMessageTime: savedMsg.createdAt,
                  timestamp: new Date(savedMsg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
                }
              : c
          );
          return [...updated].sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          });
        });
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
  const filteredMessages = currentMessages.filter(msg => {
    if (!searchMessageQuery) return true;
    return msg.content?.toLowerCase().includes(searchMessageQuery.toLowerCase());
  });

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
                searchMessageQuery={searchMessageQuery}
                setSearchMessageQuery={setSearchMessageQuery}
                showMessageSearch={showMessageSearch}
                setShowMessageSearch={setShowMessageSearch}
              />

              {/* Message Search Count Bar */}
              {showMessageSearch && searchMessageQuery && (
                <div className="bg-blue-50 dark:bg-blue-900/10 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between select-none font-semibold text-left">
                  <span>Found {filteredMessages.length} matching messages</span>
                  <button 
                    onClick={() => setSearchMessageQuery('')}
                    className="text-primary hover:underline font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Messages */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center py-20">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-base">
                          {searchMessageQuery ? 'No messages match your search' : 'No messages yet. Start the conversation!'}
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

                      {filteredMessages.map((msg, index) => (
                        <MessageBubble
                          key={msg.id || index}
                          message={msg}
                          isOwnMessage={msg.isOwn}
                          onReact={handleReact}
                          onImageClick={setLightboxUrl}
                          currentUserId={ourId}
                          onReply={(m) => setReplyingMessage(m)}
                          onForward={(m) => {
                            setForwardingMessage(m);
                            setShowForwardModal(true);
                          }}
                          onDelete={(m) => setDeleteModalMsg(m)}
                          searchQuery={searchMessageQuery}
                          scrollToMessage={scrollToMessage}
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
                replyingTo={replyingMessage}
                onCancelReply={() => setReplyingMessage(null)}
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

      {/* Delete Message Dialog */}
      <AnimatePresence>
        {deleteModalMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-805 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-left">
                Delete Message?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-left leading-relaxed">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-2">
                {(deleteModalMsg.isOwn || deleteModalMsg.sender === 'You') && (
                  <button
                    onClick={() => executeDeleteMessage(deleteModalMsg, 'everyone')}
                    className="w-full py-2 bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Delete for Everyone
                  </button>
                )}
                <button
                  onClick={() => executeDeleteMessage(deleteModalMsg, 'me')}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-950 dark:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Delete for Me
                </button>
                <button
                  onClick={() => setDeleteModalMsg(null)}
                  className="w-full py-2 text-gray-500 hover:text-gray-750 dark:text-gray-450 text-xs font-semibold transition-colors mt-1 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forward Message Modal */}
      <AnimatePresence>
        {showForwardModal && forwardingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-700 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-bold text-gray-905 dark:text-white">
                  Forward Message
                </h3>
                <button
                  onClick={() => {
                    setShowForwardModal(false);
                    setForwardingMessage(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[45vh]">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => executeForwardMessage(chat, forwardingMessage)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {chat.name}
                      </p>
                      <p className="text-[10px] text-gray-550 dark:text-gray-400 truncate">
                        @{chat.username}
                      </p>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full select-none cursor-pointer">
                      Send
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
