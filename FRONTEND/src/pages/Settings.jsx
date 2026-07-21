import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, Moon, Sun, MessageSquare, Ban, Laptop, Info, 
  ArrowLeft, Camera, Save, Loader2, LogOut, CheckCircle2, AlertCircle, X, ShieldAlert 
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { API_BASE_URL } from '../config/api';

const Settings = ({ onNavigate }) => {
  const { currentUser, updateCurrentUser, darkMode, toggleDarkMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'privacy' | 'notifications' | 'appearance' | 'chats' | 'blocked' | 'devices' | 'about'
  
  // Account Form states
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(currentUser || {});
  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // General Notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Blocked Users State
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [fetchingBlocked, setFetchingBlocked] = useState(false);

  // Privacy change password state
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Trigger Toast Notification helper
  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state with currentUser
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
    }
  }, [currentUser]);

  // Load Blocked Users when entering that section
  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    setFetchingBlocked(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Filter users who are blocked by us
        const blocked = data.users.filter(u => u.isBlocked);
        setBlockedUsers(blocked);
      }
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
    } finally {
      setFetchingBlocked(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/unblock/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockedUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));
        triggerToast('success', 'User unblocked successfully');
      } else {
        triggerToast('error', data.message || 'Failed to unblock user');
      }
    } catch (err) {
      console.error("Unblock failed:", err);
      triggerToast('error', 'Connection to backend failed');
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData.name,
          bio: userData.bio,
          phone: userData.phone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = {
          ...currentUser,
          name: data.user.name,
          bio: data.user.bio,
          phone: data.user.phone
        };
        updateCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        triggerToast('success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        triggerToast('error', data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error("Save profile error:", err);
      triggerToast('error', 'Connection to backend failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('error', 'Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('error', 'File size must be less than 5MB');
      return;
    }

    setUploading(true);
    // Local instant preview
    const previewUrl = URL.createObjectURL(file);
    setUserData(prev => ({ ...prev, avatar: previewUrl }));

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = {
          ...currentUser,
          avatar: data.avatar
        };
        updateCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        triggerToast('success', 'Profile picture updated');
      } else {
        triggerToast('error', data.message || 'Failed to upload photo');
        setUserData(prev => ({ ...prev, avatar: currentUser?.avatar }));
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      triggerToast('error', 'Failed to connect to backend upload service');
      setUserData(prev => ({ ...prev, avatar: currentUser?.avatar }));
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      triggerToast('error', 'Please fill in all fields');
      return;
    }
    setPassLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwords)
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast('success', 'Password updated successfully');
        setPasswords({ oldPassword: '', newPassword: '' });
      } else {
        triggerToast('error', data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error("Password update error:", err);
      triggerToast('error', 'Password update endpoint not configured or offline');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateCurrentUser(null);
    onNavigate('welcome');
  };

  const sidebarMenuItems = [
    { id: 'account', label: 'Account', subtitle: 'Profile & Account settings', icon: User },
    { id: 'privacy', label: 'Privacy', subtitle: 'Privacy & security settings', icon: Lock },
    { id: 'notifications', label: 'Notifications', subtitle: 'Manage your notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', subtitle: 'Theme & display settings', icon: Moon },
    { id: 'chats', label: 'Chats', subtitle: 'Chat settings & history', icon: MessageSquare },
    { id: 'blocked', label: 'Blocked Users', subtitle: 'Manage blocked users', icon: Ban },
    { id: 'devices', label: 'Devices', subtitle: 'Manage your devices', icon: Laptop },
    { id: 'about', label: 'About', subtitle: 'App information', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-905 dark:text-white flex flex-col md:flex-row select-none">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl shadow-xl max-w-sm w-full select-none"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-505 flex-shrink-0" size={18} />
            ) : (
              <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            )}
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-left flex-1 leading-relaxed">
              {toast.message}
            </span>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar Panel */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/60 flex flex-col p-5">
        
        {/* Back Link Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer text-gray-600 dark:text-gray-300 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Settings</span>
        </div>

        {/* User Card at top */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-6">
          <img
            src={userData.avatar || 'https://i.pravatar.cc/150?img=10'}
            alt="User avatar"
            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-inner"
          />
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {userData.name}
            </h4>
            <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3.5 text-left border ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-105/30 text-primary dark:bg-primary/10 dark:border-primary/20 dark:text-blue-400'
                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400'} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight truncate">
                    {item.label}
                  </p>
                  <p className={`text-[9px] leading-tight mt-0.5 truncate ${
                    isActive ? 'text-primary/70 dark:text-blue-400/70' : 'text-gray-400'
                  }`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout at bottom */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-100 dark:border-red-900/30"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl mx-auto w-full text-left"
          >
            {/* Header info for currently active tab */}
            {(() => {
              const activeItem = sidebarMenuItems.find(i => i.id === activeTab);
              if (!activeItem) return null;
              const HeaderIcon = activeItem.icon;
              return (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <HeaderIcon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {activeItem.label}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 select-none">
                      {activeItem.subtitle}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Dynamic settings components */}
            
            {/* 1. Account Section */}
            {activeTab === 'account' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Photo Change Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="relative flex-shrink-0">
                    <img
                      src={userData.avatar || 'https://i.pravatar.cc/150?img=10'}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-650 transition-colors shadow-lg cursor-pointer flex items-center justify-center"
                    >
                      {uploading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Camera size={13} />
                      )}
                    </button>
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {userData.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Allowed PNG, JPG or WEBP. Max size 5MB.
                    </p>
                    <div className="flex gap-2.5 mt-3 justify-center sm:justify-start">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={userData.name || ''}
                        onChange={(e) => setUserData(p => ({ ...p, name: e.target.value }))}
                        className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    ) : (
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium bg-gray-50/50 dark:bg-gray-700/20 px-3 py-2 rounded-xl border border-gray-150/40 dark:border-gray-700/20">
                        {userData.name}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Username
                    </label>
                    <p className="text-xs text-gray-850 dark:text-gray-300 font-medium bg-gray-50/50 dark:bg-gray-700/20 px-3 py-2 rounded-xl border border-gray-150/40 dark:border-gray-700/20">
                      @{userData.username}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={userData.email || ''}
                        onChange={(e) => setUserData(p => ({ ...p, email: e.target.value }))}
                        className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    ) : (
                      <p className="text-xs text-gray-800 dark:text-gray-205 font-medium bg-gray-50/50 dark:bg-gray-700/20 px-3 py-2 rounded-xl border border-gray-150/40 dark:border-gray-700/20">
                        {userData.email || `${userData.username}@example.com`}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone || ''}
                        onChange={(e) => setUserData(p => ({ ...p, phone: e.target.value }))}
                        className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    ) : (
                      <p className="text-xs text-gray-800 dark:text-gray-205 font-medium bg-gray-50/50 dark:bg-gray-700/20 px-3 py-2 rounded-xl border border-gray-150/40 dark:border-gray-700/20">
                        {userData.phone || 'No phone provided'}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Bio / About
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={userData.bio || ''}
                        onChange={(e) => setUserData(p => ({ ...p, bio: e.target.value }))}
                        rows={3}
                        className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      />
                    ) : (
                      <p className="text-xs text-gray-850 dark:text-gray-205 font-medium bg-gray-50/50 dark:bg-gray-700/20 px-3 py-2 rounded-xl border border-gray-150/40 dark:border-gray-700/20 leading-relaxed">
                        {userData.bio || 'Hello, I am using Secure Chat!'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Changes Controls */}
                {isEditing && (
                  <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="px-5 py-2 bg-primary hover:bg-blue-650 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                      {saveLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. Privacy Section */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Password update form */}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/50 select-none">
                    Update Account Password
                  </h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      Old Password
                    </label>
                    <input
                      type="password"
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                      className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      className="px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="mt-3 px-5 py-2 bg-primary hover:bg-blue-650 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-80"
                  >
                    {passLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. Notifications Section */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Item 1: Push Notifications */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                      Push Notifications
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-0.5 leading-relaxed">
                      Receive push notifications for new messages
                    </p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center p-0.5 ${
                      pushNotifications ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-650 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Item 2: Email Notifications */}
                <div className="flex items-center justify-between py-4">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                      Email Notifications
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-0.5 leading-relaxed">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center p-0.5 ${
                      emailNotifications ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-650 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Appearance Section */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Theme Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Light Theme Card */}
                  <div
                    onClick={() => {
                      if (darkMode) toggleDarkMode();
                    }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer flex flex-col justify-between h-28 transition-all ${
                      !darkMode 
                        ? 'border-primary bg-blue-50/20 dark:bg-transparent' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <Sun size={22} className={!darkMode ? 'text-primary' : 'text-gray-400'} />
                      {!darkMode && <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Light Mode</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Classic clean interface</p>
                    </div>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    onClick={() => {
                      if (!darkMode) toggleDarkMode();
                    }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer flex flex-col justify-between h-28 transition-all ${
                      darkMode 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <Moon size={20} className={darkMode ? 'text-blue-400' : 'text-gray-400'} />
                      {darkMode && <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Dark Mode</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Easy on the eyes at night</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Chats Section */}
            {activeTab === 'chats' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/50">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-905 dark:text-white">
                        Press Enter to Send
                      </h4>
                      <p className="text-[10px] text-gray-505 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Enter key will send message; Shift+Enter inserts new lines
                      </p>
                    </div>
                    <button
                      className="relative w-11 h-6 rounded-full bg-primary flex items-center justify-end p-0.5 cursor-pointer"
                    >
                      <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  <div className="pt-2 text-left">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                      Clear Conversations
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4">
                      Delete all chat logs permanently. This action is irreversible.
                    </p>
                    <button
                      onClick={() => triggerToast('error', 'History cleaning is disabled for security')}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs cursor-pointer border border-red-100 dark:border-red-900/30"
                    >
                      Clear All Chats
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Blocked Users Section */}
            {activeTab === 'blocked' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col">
                
                {fetchingBlocked ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-[10px] font-bold text-gray-400">Loading blocked users...</span>
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center opacity-85 select-none">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700">
                      <ShieldAlert size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">No blocked users</h4>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">Users you block will be displayed in this panel.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {blockedUsers.map((user) => (
                      <div
                        key={user._id || user.id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatar || 'https://i.pravatar.cc/150?img=10'}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-250 dark:border-gray-600"
                          />
                          <div className="min-w-0 text-left">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(user._id || user.id)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-[10px] cursor-pointer border border-emerald-100 dark:border-emerald-900/30 transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. Devices Section */}
            {activeTab === 'devices' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm text-left select-none space-y-4">
                
                <h3 className="text-xs font-bold text-gray-905 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/50">
                  Active Session details
                </h3>
                
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Laptop size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Current Browser Session
                    </h4>
                    <p className="text-[10px] text-gray-450 dark:text-gray-400 mt-1 leading-relaxed break-all">
                      {navigator.userAgent}
                    </p>
                    <span className="inline-block mt-3 text-[9px] bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/40 text-green-600 dark:text-green-400 font-bold px-2 py-0.5 rounded-full select-none">
                      Active Now
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. About Section */}
            {activeTab === 'about' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm space-y-4 select-none">
                
                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400 font-sans">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Version</span>
                    <span className="text-gray-900 dark:text-white font-bold">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="text-gray-900 dark:text-white font-bold">July 2026</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Build Number</span>
                    <span className="text-gray-900 dark:text-white font-bold">2026.07.18</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings;
