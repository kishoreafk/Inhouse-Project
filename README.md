# 🧠 AI Learning Hub

An intelligent learning platform that processes video content and creates adaptive quizzes with real-time engagement monitoring.

## ✨ Features

- **🎥 Video Processing**: Upload videos and extract transcripts automatically
- **🤖 AI Quiz Generation**: Creates personalized quizzes using Gemini AI
- **💡 Smart Hints**: Contextual hints without revealing answers
- **📊 Real-time Feedback**: Detailed explanations for wrong answers
- **👁️ Engagement Monitoring**: Facial expression detection (optional)
- **🎨 Modern UI**: Beautiful glassmorphism design

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ML Model Setup (Optional)
```bash
cd local-ml
pip install -r requirements.txt
python emotion_detector.py
```

## 🏗️ Architecture

- **Frontend**: React + TailwindCSS (Glassmorphism UI)
- **Backend**: FastAPI (Stateless)
- **Video Processing**: MoviePy + SpeechRecognition
- **ML**: MediaPipe for facial expression detection
- **AI**: Google Gemini API for content generation

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:
- `GEMINI_API_KEY`: Your Google Gemini API key

## 📡 API Endpoints

- `POST /upload_video`: Upload video and extract transcript
- `POST /generate_quiz`: Generate quiz from transcript
- `POST /generate_hint`: Get contextual hints
- `POST /evaluate_answer`: Evaluate and explain answers

## 🎯 How It Works

1. **Upload Video**: Drag & drop or select video file
2. **Transcript Extraction**: AI extracts text from video audio
3. **Quiz Generation**: Gemini AI creates adaptive questions
4. **Interactive Learning**: Answer questions with hints and explanations
5. **Progress Tracking**: Real-time performance monitoring