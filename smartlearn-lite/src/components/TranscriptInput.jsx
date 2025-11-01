import { useState } from "react";
import { Button, TextField, Box, Collapse } from '@mui/material';
import { Description, Upload } from '@mui/icons-material';

export default function TranscriptInput({ onTranscriptSubmit }) {
  const [transcript, setTranscript] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscriptSubmit(transcript);
      setShowInput(false);
    }
  };

  return (
    <Box>
      {!showInput ? (
        <Button
          variant="text"
          onClick={() => setShowInput(true)}
          startIcon={<Description />}
          sx={{ borderRadius: 2, color: 'white' }}
        >
          Add Custom Transcript
        </Button>
      ) : (
        <Collapse in={showInput}>
          <Box sx={{ p: 2, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your transcript here..."
              sx={{ mb: 2, '& .MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleSubmit} startIcon={<Upload />} sx={{ borderRadius: 2, bgcolor: 'rgba(96, 165, 250, 0.9)', '&:hover': { bgcolor: 'rgba(96, 165, 250, 1)' } }}>
                Use Transcript
              </Button>
              <Button variant="outlined" onClick={() => setShowInput(false)} sx={{ borderRadius: 2, color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'rgba(255,255,255,0.5)' } }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
