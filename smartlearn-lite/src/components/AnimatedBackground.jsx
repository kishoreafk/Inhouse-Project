import { motion } from 'framer-motion';
import { Box } from '@mui/material';

export default function AnimatedBackground() {
  return (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -1 }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${Math.random() * 0.1}) 0%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() + 0.5, 1],
            rotateZ: [0, 360],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </Box>
  );
}
