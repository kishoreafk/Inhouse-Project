import { useState, useRef } from "react";
import { Box, Container, Card, Paper, Typography, AppBar, Toolbar, Chip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { CloudUpload, Home as HomeIcon, Link as LinkIcon, Psychology as BrainIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Upload, Link2, Activity, BarChart, Brain } from 'lucide-react';
import VideoPlayer from "../components/VideoPlayer";
import AttentionMonitor from "../components/AttentionMonitor";
import QuizPopup from "../components/QuizPopup";
import TranscriptInput from "../components/TranscriptInput";
import { useAppStore } from "../store/useAppStore";
import { useFaceMonitor } from "../hooks/useFaceMonitor";
import toast from "react-hot-toast";
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

export default function UploadVideo({ onNavigate }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);
  const playerRef = useRef(null);

  const {
    currentTime,
    distractionCount,
    isPlaying,
    setTranscript,
    setCurrentTime,
    incrementDistraction,
    setIsPlaying,
    videoUrl,
    setVideoUrl,
  } = useAppStore();

  const handleDistracted = async () => {
    setIsPlaying(false);
    playerRef.current?.pause();
    incrementDistraction();
    toast.error(`You seem distracted 😅. Let's take a quick quiz!`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (videoFile) URL.revokeObjectURL(videoFile);
      const fileUrl = URL.createObjectURL(file);
      setVideoFile(fileUrl);
      setVideoUrl(fileUrl);
      toast.success("Video uploaded successfully!");
    }
  };

  useFaceMonitor(isPlaying && videoUrl, handleDistracted);

  return (
    <PageTransition>
      <AnimatedBackground />
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ py: 1.5 }}>
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
              🎓 SmartLearn Lite
            </Typography>
          </motion.div>
          
          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <motion.div
              whileHover={{ scale: 1.15, rotateZ: 5, z: 50 }}
              whileTap={{ scale: 0.95, rotateZ: -5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Chip 
                icon={<HomeIcon />} 
                label="Home" 
                onClick={() => onNavigate('home')}
                sx={{ fontWeight: 600, fontSize: '0.95rem', px: 2, py: 2.5, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.15, rotateZ: -5, z: 50 }}
              whileTap={{ scale: 0.95, rotateZ: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Chip 
                icon={<LinkIcon />} 
                label="Load URL" 
                onClick={() => onNavigate('url')}
                sx={{ fontWeight: 600, fontSize: '0.95rem', px: 2, py: 2.5, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              />
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -50, rotateX: -25, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.03, rotateY: 3, z: 30 }}
      >
        <Card elevation={0} sx={{ mb: 3, p: 3, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0, rotateZ: -180 }}
            animate={{ scale: 1, rotateZ: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.08, rotateZ: 5 }}
            whileTap={{ scale: 0.92, rotateZ: -5 }}
          >
            <LoadingButton
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<motion.div animate={{ rotateZ: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}><CloudUpload /></motion.div>}
              sx={{ borderRadius: 2, py: 2, fontWeight: 600, fontSize: '1.1rem' }}
            >
              Choose Video File
            </LoadingButton>
          </motion.div>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, rotateX: -30, scale: 0.8, z: -100 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1, z: 0 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.02, rotateY: -2, z: 20 }}
      >
        {videoUrl ? (
          <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Card elevation={0} sx={{ mb: 3, borderRadius: 5, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <VideoPlayer
                ref={playerRef}
                url={videoUrl}
                isPlaying={isPlaying}
                onProgress={setCurrentTime}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVideoLoaded={() => console.log("Video loaded")}
              />
            </Card>
          </motion.div>
        ) : (
          <Paper elevation={0} sx={{ p: 10, textAlign: 'center', mb: 3, borderRadius: 4, border: '3px dashed', borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              animate={{ 
                y: [0, -25, 0],
                rotateZ: [0, 15, -15, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <CloudUpload sx={{ fontSize: 100, color: 'rgba(255,255,255,0.8)', mb: 3 }} />
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Typography variant="h4" fontWeight={700} color="white">
                Upload a Video File
              </Typography>
            </motion.div>
          </Paper>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.7, type: 'spring' }}
        whileHover={{ scale: 1.02, rotateY: 2, z: 20 }}
      >
        <Card elevation={0} sx={{ mb: 3, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <Box sx={{ p: 3 }}>
            <TranscriptInput onTranscriptSubmit={setTranscript} />
          </Box>
        </Card>
      </motion.div>

      <AttentionMonitor onDistracted={handleDistracted} isPlaying={isPlaying} />
      {quiz && <QuizPopup quizData={quiz} onClose={() => setQuiz(null)} />}
      </Container>
    </PageTransition>
  );
}
