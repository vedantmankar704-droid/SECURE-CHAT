import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, UserCheck, UserX, Clock, ArrowLeft, Users, Check, X, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import socket from '../socket/socket';
import ChatListSkeleton from '../components/ChatListSkeleton';
import { API_BASE_URL } from '../config/api';

const Requests = ({ onNavigate }) => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'incoming' | 'outgoing'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const token = localStorage.getItem('token');

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIncomingRequests(data.incoming || []);
        setOutgoingRequests(data.outgoing || []);
      }
    } catch (err) {
      console.error('Fetch pending requests error:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // Socket listener for real-time friend request updates
  useEffect(() => {
    const handleFriendRequest = () => {
      fetchPendingRequests();
    };

    socket.on('friendRequestReceived', handleFriendRequest);
    socket.on('friendRequestAccepted', handleFriendRequest);

    return () => {
      socket.off('friendRequestReceived', handleFriendRequest);
      socket.off('friendRequestAccepted', handleFriendRequest);
    };
  }, [fetchPendingRequests]);

  // User Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/friends/search?query=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // Send Friend Request
  const handleSendRequest = async (receiverId) => {
    setActionLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Friend request sent!');
        // Update local status in search results
        setSearchResults(prev => prev.map(u => u._id === receiverId ? { ...u, friendshipStatus: 'pending_sent', requestId: data.request?._id } : u));
        fetchPendingRequests();
      } else {
        showToast(data.message || 'Failed to send request', 'error');
      }
    } catch (err) {
      showToast('Error sending friend request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (requestId, userId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Friend request accepted!');
        fetchPendingRequests();
        setSearchResults(prev => prev.map(u => (u.requestId === requestId || u._id === userId) ? { ...u, friendshipStatus: 'accepted' } : u));
      } else {
        showToast(data.message || 'Failed to accept request', 'error');
      }
    } catch (err) {
      showToast('Error accepting request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Decline / Cancel Friend Request
  const handleDeclineRequest = async (requestId, userId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/decline/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Request removed');
        fetchPendingRequests();
        setSearchResults(prev => prev.map(u => (u.requestId === requestId || u._id === userId) ? { ...u, friendshipStatus: 'none', requestId: null } : u));
      } else {
        showToast(data.message || 'Failed to decline request', 'error');
      }
    } catch (err) {
      showToast('Error declining request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
              toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}
          >
            {toast.type === 'error' ? <ShieldAlert size={18} /> : <Check size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold">Friend Requests & Discovery</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Search users by username or manage pending requests</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Search size={16} /> Find People
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors relative ${
              activeTab === 'incoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users size={16} /> Incoming
            {incomingRequests.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'outgoing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Clock size={16} /> Sent Requests
            {outgoingRequests.length > 0 && (
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {outgoingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Find People */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by username (e.g. vatsal, vedant)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-darkSideBar border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            {isSearching && (
              <ChatListSkeleton count={4} />
            )}

            {!isSearching && searchQuery.trim() !== '' && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No users found matching "{searchQuery}"
              </div>
            )}

            {!isSearching && searchQuery.trim() === '' && (
              <div className="text-center py-12 bg-white dark:bg-darkSideBar rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <Users className="mx-auto text-primary mb-3 opacity-60" size={48} />
                <h3 className="font-semibold text-lg">Search for Friends</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  Type a username above to find registered users and send them a friend request to start chatting.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-darkSideBar p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || 'https://i.pravatar.cc/150?img=10'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{user.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                      {user.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{user.bio}</p>}
                    </div>
                  </div>

                  {user.friendshipStatus === 'accepted' ? (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full flex items-center gap-1">
                      <UserCheck size={14} /> Friends
                    </span>
                  ) : user.friendshipStatus === 'pending_sent' ? (
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Clock size={14} /> Pending
                    </span>
                  ) : user.friendshipStatus === 'pending_received' ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptRequest(user.requestId, user._id)}
                      disabled={actionLoading[user.requestId]}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <UserCheck size={14} /> Accept
                    </motion.button>
                  ) : user.friendshipStatus === 'blocked' ? (
                    <span className="px-3 py-1.5 bg-gray-500/10 text-gray-400 text-xs font-semibold rounded-full">
                      Blocked
                    </span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendRequest(user._id)}
                      disabled={actionLoading[user._id]}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <UserPlus size={14} /> Add Friend
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {loadingRequests && <ChatListSkeleton count={4} />}
            
            {!loadingRequests && incomingRequests.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-darkSideBar rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <Users className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="font-semibold text-base">No Pending Friend Requests</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">When someone sends you a friend request, it will appear here.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-darkSideBar p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.sender?.avatar || 'https://i.pravatar.cc/150?img=10'}
                      alt={req.sender?.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{req.sender?.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{req.sender?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptRequest(req._id, req.sender?._id)}
                      disabled={actionLoading[req._id]}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Check size={14} /> Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeclineRequest(req._id, req.sender?._id)}
                      disabled={actionLoading[req._id]}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <X size={14} /> Decline
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Outgoing Requests */}
        {activeTab === 'outgoing' && (
          <div className="space-y-4">
            {loadingRequests && <ChatListSkeleton count={4} />}

            {!loadingRequests && outgoingRequests.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-darkSideBar rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <Clock className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="font-semibold text-base">No Sent Requests</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requests you send to other users will show up here.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-darkSideBar p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.receiver?.avatar || 'https://i.pravatar.cc/150?img=10'}
                      alt={req.receiver?.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{req.receiver?.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{req.receiver?.username}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeclineRequest(req._id, req.receiver?._id)}
                    disabled={actionLoading[req._id]}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-red-500/20 transition-colors"
                  >
                    <UserX size={14} /> Cancel
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
