# 🎓 SmartLearn Lite

A modern React-based web app with AI-powered learning, attention tracking, and smart quizzes.

## ✨ Features

- 📹 YouTube video & local video upload support
- 👁️ Real-time attention tracking (tab switching & inactivity detection)
- 🤖 AI-powered quiz generation using Gemini 1.5 Flash
- 📝 Custom transcript input
- 🎨 Beautiful UI with Tailwind CSS & Framer Motion animations
- ⚡ Fast performance with Vite

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup API Key
Edit `.env` file and add your Google Gemini API key:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Get your free API key from: https://makersuite.google.com/app/apikey

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 📦 Tech Stack

- ⚛️ React 18 + Vite
- 🎨 Tailwind CSS
- 🎥 React Player
- 🤖 Google Gemini AI
- 👁️ TensorFlow.js + MediaPipe
- ⚡ Zustand (State Management)
- 🔔 React Hot Toast
- ✨ Framer Motion

## 🎯 How It Works

1. Paste a YouTube URL or upload a local video
2. Optionally add a custom transcript
3. Watch the video while attention tracking runs
4. Get distracted? AI generates a quiz automatically!
5. Answer questions to reinforce learning

## 📁 Project Structure

```
smartlearn-lite/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.jsx
│   │   ├── QuizPopup.jsx
│   │   ├── AttentionMonitor.jsx
│   │   └── TranscriptInput.jsx
│   ├── pages/
│   │   └── Home.jsx
│   ├── store/
│   │   └── useAppStore.js
│   ├── utils/
│   │   ├── gemini.js
│   │   └── transcript.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 🔧 Configuration

All configuration is in `.env` file. Make sure to add your Gemini API key before running.

## 📝 License

MIT

---

Built with ❤️ using modern web technologies
