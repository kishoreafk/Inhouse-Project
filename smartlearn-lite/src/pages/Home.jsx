import { AppBar, Toolbar, Typography, Chip, Box, Container, Paper } from '@mui/material';
import { Link as LinkIcon, CloudUpload, Psychology as BrainIcon, VideoLibrary } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Upload, Link2, Activity, BarChart, Brain } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";
import { Toaster } from "react-hot-toast";
import AnimatedBackground from '../components/AnimatedBackground';
import Card3D from '../components/Card3D';
import PageTransition from '../components/PageTransition';

export default function Home({ onNavigate }) {
  const { currentTime, distractionCount } = useAppStore();



  return (
    <PageTransition>
      <AnimatedBackground />
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ py: 2.5, gap: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
            🎓 SmartLearn Lite
          </Typography>
          
          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Chip 
                icon={<Link2 size={18} />} 
                label="Load URL" 
                onClick={() => onNavigate('url')}
                sx={{ fontWeight: 600, fontSize: '0.95rem', px: 2, py: 2.5, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(255,255,255,0.3)' } }}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Chip 
                icon={<Upload size={18} />} 
                label="Upload Video" 
                onClick={() => onNavigate('upload')}
                sx={{ fontWeight: 600, fontSize: '0.95rem', px: 2, py: 2.5, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(255,255,255,0.3)' } }}
              />
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: -50, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-block' }}
            >
              <VideoLibrary sx={{ fontSize: 140, color: 'rgba(255,255,255,0.95)', mb: 3, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography variant="h2" fontWeight={900} color="white" sx={{ mb: 2, textShadow: '0 4px 12px rgba(0,0,0,0.2)', letterSpacing: '-1px' }}>
                Welcome to SmartLearn
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                AI-Powered Learning with Attention Monitoring
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 600, mx: 'auto' }}>
                Stay focused while learning with real-time attention tracking and interactive quizzes
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: -30 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <Card3D onClick={() => onNavigate('url')}>
              <motion.div
                animate={{ rotateZ: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Link2 size={64} color="#60A5FA" style={{ marginBottom: 16 }} />
              </motion.div>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: 'white' }}>
                Load from URL
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
                Paste a YouTube URL to start learning from online videos
              </Typography>
              <Box sx={{ display: 'inline-block', px: 4, py: 1.5, borderRadius: 10, bgcolor: 'rgba(96, 165, 250, 0.9)', color: 'white', fontWeight: 600, '&:hover': { bgcolor: 'rgba(96, 165, 250, 1)' } }}>
                Get Started
              </Box>
            </Card3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100, rotateY: 30 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
          >
            <Card3D onClick={() => onNavigate('upload')}>
              <motion.div
                animate={{ rotateZ: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload size={64} color="#60A5FA" style={{ marginBottom: 16 }} />
              </motion.div>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: 'white' }}>
                Upload Video
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
                Upload your own video files for personalized learning
              </Typography>
              <Box sx={{ display: 'inline-block', px: 4, py: 1.5, borderRadius: 10, bgcolor: 'rgba(96, 165, 250, 0.9)', color: 'white', fontWeight: 600, '&:hover': { bgcolor: 'rgba(96, 165, 250, 1)' } }}>
                Get Started
              </Box>
            </Card3D>
          </motion.div>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <Paper elevation={0} sx={{ p: 4, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center', color: 'white' }}>
              ✨ Features
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 10, z: 50 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Activity size={36} color="#34D399" style={{ margin: '0 auto 12px' }} />
                  </motion.div>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Attention Tracking
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                    Real-time monitoring using AI
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 10, z: 50 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain size={36} color="#F472B6" style={{ margin: '0 auto 12px' }} />
                  </motion.div>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Smart Quizzes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                    AI-generated questions on distraction
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 10, z: 50 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BarChart size={36} color="#FBBF24" style={{ margin: '0 auto 12px' }} />
                  </motion.div>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Progress Stats
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                    Track your learning metrics
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Box component="footer" sx={{ mt: 6, py: 3, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="body2" sx={{ fontWeight: 400, mb: 0.5, opacity: 0.8 }}>Built with React, Material UI, Gemini AI & TensorFlow.js</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 1 }}>v1.0 Beta</Typography>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>Stay focused, learn better! 🚀</Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </PageTransition>
  );
}
