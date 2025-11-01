import { motion } from 'framer-motion';
import { Paper } from '@mui/material';
import { useState } from 'react';

export default function Card3D({ children, onClick, sx = {} }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateY((x - centerX) / 10);
    setRotateX((centerY - y) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.05, z: 50 }}
      whileTap={{ scale: 0.98 }}
    >
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 5,
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          transformStyle: 'preserve-3d',
          '&:hover': {
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.15)',
          },
          ...sx,
        }}
      >
        {children}
      </Paper>
    </motion.div>
  );
}
