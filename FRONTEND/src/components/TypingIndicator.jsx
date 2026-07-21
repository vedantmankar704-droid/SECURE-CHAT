import { motion } from 'framer-motion';

const TypingIndicator = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    },
    exit: { opacity: 0 }
  };

  const dotVariants = {
    initial: { y: '0%' },
    animate: {
      y: ['0%', '-60%', '0%'],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center gap-1 px-1 h-3"
    >
      <motion.div
        variants={dotVariants}
        className="w-1.5 h-1.5 bg-primary rounded-full"
      />
      <motion.div
        variants={dotVariants}
        className="w-1.5 h-1.5 bg-primary rounded-full"
      />
      <motion.div
        variants={dotVariants}
        className="w-1.5 h-1.5 bg-primary rounded-full"
      />
    </motion.div>
  );
};

export default TypingIndicator;
