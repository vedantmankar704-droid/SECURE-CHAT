import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Mail, Phone, MapPin, Edit2, Save, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Profile = ({ onNavigate }) => {
  const { currentUser, updateCurrentUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(currentUser || {});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Sync userData state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
    }
  }, [currentUser]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaveLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
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
        // Update local storage and global store state
        updateCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setError('Connection to backend failed. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setUserData(prev => ({ ...prev, avatar: previewUrl }));

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const updatedUser = {
          ...currentUser,
          avatar: data.avatar
        };
        setUserData(prev => ({ ...prev, avatar: data.avatar }));
        updateCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setError(data.message || 'Failed to upload profile picture.');
        setUserData(prev => ({ ...prev, avatar: currentUser?.avatar }));
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to connect to backend upload service.');
      setUserData(prev => ({ ...prev, avatar: currentUser?.avatar }));
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-darkBg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-600 text-white py-8 px-6"
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 py-8"
      >
        {/* Profile Picture Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <img
                src={userData.avatar || 'https://i.pravatar.cc/150?img=10'}
                alt="Profile"
                className={`w-24 h-24 rounded-full object-cover border-4 border-primary transition-all duration-300 ${uploading ? 'opacity-70 blur-[1px]' : ''}`}
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
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-80"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {userData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your Account</p>
              {error && (
                <p className="text-xs text-red-500 font-semibold mt-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-3 py-1 rounded-lg">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3.5 rounded-xl text-sm mb-6 flex items-center gap-2"
          >
            <span className="font-semibold">Success:</span> {success}
          </motion.div>
        )}

        {/* Account Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Information
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={saveLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-80"
            >
              {isEditing ? (
                saveLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )
              ) : (
                <>
                  <Edit2 size={16} />
                  Edit Profile
                </>
              )}
            </motion.button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{userData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{userData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{userData.phone}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{userData.bio || 'No bio added yet'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
          <h3 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h3>
          <p className="text-gray-900 dark:text-white mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Account
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
