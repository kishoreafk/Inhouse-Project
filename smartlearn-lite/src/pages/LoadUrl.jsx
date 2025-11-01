import { useState, useRef } from "react";
import { Box, Container, TextField, Card, Paper, Typography, AppBar, Toolbar, Chip, Button, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PlayCircle as PlayIcon, Home as HomeIcon, CloudUpload, Psychology as BrainIcon, Summarize as SummarizeIcon, KeyOutlined as KeyIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Upload, Link2, Activity, BarChart, Brain, MessageSquare } from 'lucide-react';
import VideoPlayer from "../components/VideoPlayer";
import AttentionMonitor from "../components/AttentionMonitor";
import QuizPopup from "../components/QuizPopup";
import TranscriptInput from "../components/TranscriptInput";
import { useAppStore } from "../store/useAppStore";
import { useFaceMonitor } from "../hooks/useFaceMonitor";
import toast from "react-hot-toast";
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

export default function LoadUrl({ onNavigate }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeature, setAiFeature] = useState(""); // "summary", "keypoints", "question"
  const [aiResult, setAiResult] = useState("");
  const [questionInput, setQuestionInput] = useState("");
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
    setLoading(true);

    const getYouTubeId = (url) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      return match ? match[1] : null;
    };
    const videoId = getYouTubeId(videoUrl);

    if (videoId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get-quiz?videoId=${videoId}`);
        setLoading(false);
        if (response.ok) {
          const quizData = await response.json();
          if (quizData.sessionId && quizData.question) {
            setQuiz(quizData);
          } else {
            toast.error("Failed to generate quiz from the transcript.");
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Could not generate quiz for this video.");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Failed to fetch quiz.");
      }
    } else {
      setLoading(false);
      toast.error("Could not get video ID from URL.");
    }
  };

  const handleUrlSubmit = () => {
    const trimmed = videoUrl.trim();
    if (trimmed) {
      setVideoUrl(trimmed);
      toast.success("Video loaded!");
    }
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const handleSummarizeTranscript = async () => {
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    setAiLoading(true);
    setAiFeature("summary");
    setAiResult("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/summarize?videoId=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setAiResult(data.summary);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate summary");
      }
    } catch (error) {
      toast.error("Failed to fetch summary");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetKeyPoints = async () => {
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    setAiLoading(true);
    setAiFeature("keypoints");
    setAiResult("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/key-points?videoId=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setAiResult(data.keyPoints);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate key points");
      }
    } catch (error) {
      toast.error("Failed to fetch key points");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    setAiLoading(true);
    setAiFeature("question");
    setAiResult("");

    try {
      const response = await fetch('http://127.0.0.1:5000/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          question: questionInput.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResult(data.answer);
        setQuestionInput(""); // Clear input after successful question
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to get answer");
      }
    } catch (error) {
      toast.error("Failed to send question");
    } finally {
      setAiLoading(false);
    }
  };

  useFaceMonitor(isPlaying && videoUrl, handleDistracted);

  return (
    <PageTransition>
      <AnimatedBackground />
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ py: 2.5 }}>
          <motion.div style={{ transform: 'scaleX(-1)' }}>
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
                icon={<CloudUpload />} 
                label="Upload Video" 
                onClick={() => onNavigate('upload')}
                sx={{ fontWeight: 600, fontSize: '0.95rem', px: 2, py: 2.5, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              />
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -50, rotateX: -25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        whileHover={{ scale: 1.02, rotateY: 2 }}
      >
        <Card elevation={0} sx={{ mb: 3, p: 3, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <TextField
              fullWidth
              placeholder="Paste YouTube URL here..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              sx={{ mb: 2, '& .MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } } }}
            />
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, rotateZ: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <LoadingButton
              fullWidth
              variant="contained"
              loading={loading}
              onClick={handleUrlSubmit}
              startIcon={<PlayIcon />}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            >
              Load Video
            </LoadingButton>
          </motion.div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -30, z: -100 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.02, rotateX: 2, z: 20 }}
      >
        {videoUrl ? (
          <motion.div
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
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
                scale: [1, 1.2, 1],
                rotateZ: [0, 10, -10, 0],
                rotateY: [0, 360]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <PlayIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.8)', mb: 3 }} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Typography variant="h4" fontWeight={700} color="white">
                Enter YouTube URL Above
              </Typography>
            </motion.div>
          </Paper>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.7, type: 'spring' }}
        whileHover={{ scale: 1.02, rotateY: -2, z: 20 }}
      >
        <Card elevation={0} sx={{ mb: 3, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <Box sx={{ p: 3 }}>
            <TranscriptInput onTranscriptSubmit={setTranscript} />
          </Box>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.7, type: 'spring' }}
        whileHover={{ scale: 1.02 }}
      >
        {videoUrl && (
          <Card elevation={0} sx={{ mb: 3, borderRadius: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: 'white', textAlign: 'center' }}>
                🤖 AI Learning Assistant
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                Get insights from the video transcript using AI
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'center' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <LoadingButton
                    variant="contained"
                    startIcon={<SummarizeIcon />}
                    loading={aiLoading && aiFeature === "summary"}
                    onClick={handleSummarizeTranscript}
                    sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 600, textTransform: 'none' }}
                  >
                    Summarize Transcript
                  </LoadingButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <LoadingButton
                    variant="contained"
                    startIcon={<KeyIcon />}
                    loading={aiLoading && aiFeature === "keypoints"}
                    onClick={handleGetKeyPoints}
                    sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 600, textTransform: 'none', backgroundColor: 'rgba(96, 165, 250, 0.8)' }}
                  >
                    Get Key Points
                  </LoadingButton>
                </motion.div>
              </Box>

              {/* Question Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
                  <MessageSquare size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Ask a Question
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your question about the video..."
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    sx={{ '& .MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LoadingButton
                      variant="contained"
                      loading={aiLoading && aiFeature === "question"}
                      onClick={handleAskQuestion}
                      sx={{ borderRadius: 3, px: 3, backgroundColor: 'rgba(34, 197, 94, 0.8)', '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.9)' } }}
                    >
                      Ask
                    </LoadingButton>
                  </motion.div>
                </Box>
              </Box>

              {/* Results Display */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
                    {aiFeature === "summary" && "📋 Summary"}
                    {aiFeature === "keypoints" && "🔑 Key Points"}
                    {aiFeature === "question" && "💡 Answer"}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      '& pre': { margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', color: 'rgba(255,255,255,0.9)' },
                      '& p': { margin: 0, color: 'rgba(255,255,255,0.9)' },
                      '& ul': { color: 'rgba(255,255,255,0.9)' },
                      '& li': { color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }
                    }}
                  >
                    {aiResult.includes('- ') ? (
                      <div dangerouslySetInnerHTML={{ __html: aiResult.replace(/\n/g, '<br />') }} />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
                        {aiResult}
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              )}
            </Box>
          </Card>
        )}
      </motion.div>

      <AttentionMonitor onDistracted={handleDistracted} isPlaying={isPlaying} />
      {quiz && <QuizPopup quizData={quiz} onClose={() => setQuiz(null)} />}
      </Container>
    </PageTransition>
  );
}
