# 🎓 SmartLearn - AI-Powered Learning Platform

An intelligent video learning platform that combines AI-driven quiz generation, real-time attention tracking, and interactive learning experiences to enhance educational outcomes.

## 📸 Screenshots

### AI Assistant First Page
![AI Assistant First Page](./img/AI%20Assistant%20First%20Page.png)

### AI Assistant Home Page
![AI Assistant Home Page](./img/AI%20Assistant%20Home%20Page.png)

## ✨ Features

### 🎥 Video Learning & Processing
- **YouTube Video Integration**: Seamless support for YouTube videos with automatic transcript extraction
- **Local Video Upload**: Support for uploading and processing local video files
- **Multi-Method Transcript Extraction**: Robust transcript retrieval using multiple libraries (yt-dlp, youtube-transcript-api, pytube, youtube-dl)
- **Custom Transcript Input**: Manual transcript input for videos without automatic captions

### 🤖 AI-Powered Learning Tools
- **Intelligent Quiz Generation**: AI-generated multiple-choice questions from video transcripts using Google Gemini 2.5 Flash
- **Smart Summarization**: Automatic generation of concise video summaries
- **Key Points Extraction**: AI-powered extraction of main learning points
- **Interactive Q&A**: Ask questions about video content and get AI-powered answers

### 👁️ Real-Time Attention Monitoring
- **Face Detection**: OpenCV-powered facial recognition for engagement tracking
- **Distraction Detection**: Monitors user attention and triggers quizzes when distracted
- **Activity Logging**: Detailed logging of user engagement patterns
- **Camera Integration**: Webcam access for real-time monitoring

### 🎨 Modern User Interface
- **Responsive Design**: Beautiful, mobile-friendly interface built with React
- **3D Animations**: Interactive card components with CSS transforms
- **Particle Effects**: Engaging background animations
- **Smooth Transitions**: Page transitions with Framer Motion
- **Dark/Light Theme**: Customizable theme system

## 🏗️ System Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend│◄────────────────►│  Flask Backend  │
│   (Port 5173)   │                  │   (Port 5000)   │
└─────────────────┘                  └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                  ┌─────────────────┐
│   Video Player  │                  │ Transcript APIs  │
│   Components    │                  │   (YouTube)     │
└─────────────────┘                  └─────────────────┘
                                             │
                                             ▼
                                   ┌─────────────────┐
                                   │   Google Gemini │
                                   │      AI API     │
                                   └─────────────────┘
                                             │
                                             ▼
                                   ┌─────────────────┐
                                   │   OpenCV Camera │
                                   │   Monitoring    │
                                   └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Webcam access (for attention monitoring)
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/kishoreafk/Inhouse-Project.git
cd AI-Video-Learning
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp smartlearn-lite/.env.example smartlearn-lite/.env
# Edit .env file and add your Google Gemini API key:
# VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup
```bash
cd smartlearn-lite

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Backend Server
```bash
# From project root directory
python video_monitor_server.py
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📋 API Documentation

### Attention Monitoring
- `POST /start-monitoring` - Start camera monitoring
- `POST /stop-monitoring` - Stop monitoring and get activity log
- `GET /status` - Get current monitoring status

### Quiz System
- `GET /get-quiz?videoId={id}` - Generate quiz from video transcript
- `POST /check-answer` - Check quiz answer
- `POST /next-question` - Get next quiz question

### AI Features
- `GET /summarize?videoId={id}` - Generate video summary
- `GET /key-points?videoId={id}` - Extract key learning points
- `POST /ask-question` - Ask questions about video content

### Example API Usage
```python
import requests

# Generate quiz
response = requests.get('http://localhost:5000/get-quiz?videoId=dQw4w9WgXcQ')
quiz_data = response.json()

# Check answer
answer_data = {
    'sessionId': quiz_data['sessionId'],
    'answer': 'A'
}
result = requests.post('http://localhost:5000/check-answer', json=answer_data)
```

## 📁 Project Structure

```
AI-Video-Learning/
├── README.md                          # Project documentation
├── requirements.txt                   # Python dependencies
├── video_monitor_server.py           # Main Flask backend server
├── transcript_extractor.py            # YouTube transcript extraction
├── user_monitor.py                    # Standalone attention monitor
├── smartlearn/                        # Python virtual environment
└── smartlearn-lite/                   # React frontend application
    ├── public/
    ├── src/
    │   ├── components/                # React components
    │   │   ├── VideoPlayer.jsx        # Video playback component
    │   │   ├── QuizPopup.jsx          # Quiz interface
    │   │   ├── AttentionMonitor.jsx   # Monitoring controls
    │   │   └── TranscriptInput.jsx    # Custom transcript input
    │   ├── pages/                     # Application pages
    │   ├── hooks/                     # Custom React hooks
    │   ├── store/                     # Zustand state management
    │   └── assets/                    # Static assets
    ├── package.json                   # Node.js dependencies
    ├── vite.config.js                 # Vite configuration
    └── tailwind.config.js             # Tailwind CSS config
```

## 🛠️ Tech Stack

### Backend (Python)
- **Flask** - Web framework with CORS support
- **OpenCV** - Computer vision for face detection
- **Google Gemini AI** - AI-powered content generation
- **YouTube APIs** - Multiple libraries for transcript extraction:
  - `yt-dlp` - Modern YouTube downloader
  - `youtube-transcript-api` - Direct transcript API
  - `pytube` - YouTube video processing
  - `youtube-dl` - Legacy YouTube downloader

### Frontend (JavaScript/React)
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - Lightweight state management
- **React Player** - Universal video player
- **React Hot Toast** - Notification system

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `smartlearn-lite` directory:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Camera Permissions
The application requires webcam access for attention monitoring. Ensure your browser allows camera permissions when prompted.

### API Keys
- **Google Gemini API**: Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- The API key is used for AI-powered quiz generation, summarization, and Q&A features

## 🎯 How It Works

1. **Video Selection**: Choose a YouTube video or upload a local file
2. **Transcript Processing**: Automatic transcript extraction using multiple fallback methods
3. **Learning Session**: Watch the video with optional attention monitoring
4. **AI Interaction**: Generate quizzes, summaries, or ask questions about the content
5. **Distraction Handling**: When distracted, the system automatically generates quizzes to reinforce learning


**Built with ❤️ for enhanced learning experiences**
