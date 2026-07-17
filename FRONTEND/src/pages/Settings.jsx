import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, Eye, Globe, LogOut } from 'lucide-react';
import { useState } from 'react';

const Settings = ({ onNavigate }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    readReceipts: true,
    typing: true,
    lastSeen: true,
    privacy: 'everyone',
    twoFactor: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
      </div>
      <motion.button
        onClick={onChange}
        animate={{ backgroundColor: value ? '#0084ff' : '#d1d5db' }}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 0 }}
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
        />
      </motion.button>
    </div>
  );

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
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 py-8"
      >
        {/* Notifications */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={24} className="text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>

          <SettingToggle
            label="Push Notifications"
            description="Receive push notifications for new messages"
            value={settings.notifications}
            onChange={() => handleToggle('notifications')}
          />

          <SettingToggle
            label="Email Notifications"
            description="Receive email notifications for important updates"
            value={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />

          <SettingToggle
            label="Read Receipts"
            description="Let others know when you've read their messages"
            value={settings.readReceipts}
            onChange={() => handleToggle('readReceipts')}
          />

          <SettingToggle
            label="Typing Indicator"
            description="Show when you're typing"
            value={settings.typing}
            onChange={() => handleToggle('typing')}
          />

          <SettingToggle
            label="Last Seen"
            description="Let others see when you were last active"
            value={settings.lastSeen}
            onChange={() => handleToggle('lastSeen')}
          />
        </div>

        {/* Privacy & Security */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={24} className="text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Privacy & Security
            </h2>
          </div>

          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                Who can message you?
              </label>
              <div className="space-y-2">
                {['Everyone', 'Contacts Only', 'Nobody'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="privacy"
                      value={option.toLowerCase().replace(' ', '-')}
                      checked={settings.privacy === option.toLowerCase().replace(' ', '-')}
                      onChange={(e) => handleChange('privacy', e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <SettingToggle
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactor}
              onChange={() => handleToggle('twoFactor')}
            />

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Change Password
              </motion.button>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} className="text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              App Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                Language
              </label>
              <select className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div className="pb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                Theme
              </label>
              <div className="space-y-2">
                {['Light', 'Dark', 'Auto'].map((theme) => (
                  <label key={theme} className="flex items-center">
                    <input type="radio" name="theme" className="w-4 h-4 text-primary" />
                   <span className="ml-3 text-gray-900 dark:text-white">{theme}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            About
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Last Updated</span>
              <span className="text-gray-900 dark:text-white">July 2024</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Build Number</span>
              <span className="text-gray-900 dark:text-white">2024.07.01</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('login')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Settings;
