import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';

const Profile = ({ onNavigate, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(currentUser || {});

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
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
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
              />
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {userData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your Account</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Information
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditing ? (
                <>
                  <Save size={16} />
                  Save Changes
                </>
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
