import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
