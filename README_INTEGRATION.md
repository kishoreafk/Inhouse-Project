# Face Monitor Integration with Online Video

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the face monitoring server:
```bash
python video_monitor_server.py
```

3. Start the React frontend:
```bash
cd smartlearn-lite
npm install
npm run dev
```

## How It Works

- Face monitoring starts automatically when video begins playing
- Monitoring stops when video is paused or ended
- Server runs on `http://localhost:5000`
- Frontend communicates with server via REST API

## API Endpoints

- `POST /start-monitoring` - Start face detection
- `POST /stop-monitoring` - Stop face detection and get logs
- `GET /status` - Get current monitoring status
