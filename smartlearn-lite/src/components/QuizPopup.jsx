import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, LinearProgress, IconButton, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Close, Lightbulb } from '@mui/icons-material';
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function QuizPopup({ quizData, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState({
    question: quizData.question,
    options: quizData.options,
    questionNumber: quizData.questionNumber,
    totalQuestions: quizData.totalQuestions
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentAnswer) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: quizData.sessionId, answer: currentAnswer })
      });
      const result = await response.json();
      
      if (result.correct) {
        toast.success("Correct! Moving to next question...");
        const nextResponse = await fetch("http://127.0.0.1:5000/next-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: quizData.sessionId })
        });
        const nextData = await nextResponse.json();
        
        if (nextData.completed) {
          toast.success("Quiz completed! Great job!");
          onClose();
        } else {
          setCurrentQuestion({
            question: nextData.question,
            options: nextData.options,
            questionNumber: nextData.questionNumber,
            totalQuestions: nextData.totalQuestions
          });
          setCurrentAnswer("");
          setShowHint(false);
        }
      } else {
        toast.error("Wrong answer. Check the hint!");
        setHint(result.hint);
        setShowHint(true);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      toast.error("Failed to check answer");
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight={700} color="primary">Quick Quiz 🧠</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <LinearProgress variant="determinate" value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100} sx={{ height: 6 }} />
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
        </Typography>

        <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            {currentQuestion.question}
          </Typography>
          <RadioGroup value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)}>
            {currentQuestion.options.map((opt, j) => (
              <FormControlLabel
                key={j}
                value={opt}
                control={<Radio />}
                label={opt}
                sx={{
                  border: '2px solid',
                  borderColor: currentAnswer === opt ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1,
                  bgcolor: currentAnswer === opt ? 'primary.light' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              />
            ))}
          </RadioGroup>
        </Box>

        {showHint && (
          <Alert severity="warning" icon={<Lightbulb />} sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>Hint:</Typography>
            <Typography variant="body2">{hint}</Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!currentAnswer || loading}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          {loading ? "Checking..." : "Submit Answer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
