import { motion } from 'framer-motion';

const ProfileSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 animate-pulse"
    >
      {/* Cover Header */}
      <div className="h-32 bg-gray-200 dark:bg-gray-700" />

      {/* Avatar & Main Info */}
      <div className="px-6 pb-6 relative">
        <div className="-mt-16 mb-4 flex justify-between items-end">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
        </div>

        <div className="space-y-3">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-48" />
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5" />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-md" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-40" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-md" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-52" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSkeleton;
