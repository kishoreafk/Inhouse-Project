# System Architecture

## Overview
The Adaptive E-Learning Platform consists of four main components that work together to provide personalized learning experiences.

## Components

### 1. Frontend (React + TailwindCSS)
- **Purpose**: User interface for quiz interaction
- **Key Features**:
  - Quiz display with multiple choice options
  - Hint system with modal dialogs
  - Progress tracking and performance metrics
  - Responsive design for various screen sizes

### 2. Backend (FastAPI + Python)
- **Purpose**: API server and business logic
- **Key Endpoints**:
  - `POST /generate_quiz`: Creates quizzes from transcripts
  - `POST /generate_hint`: Provides contextual hints
  - `POST /evaluate_answer`: Evaluates and explains answers
  - `GET /progress/{user_id}`: Retrieves user progress
- **Features**:
  - Gemini AI integration for content generation
  - SQLite database for progress tracking
  - CORS support for frontend communication

### 3. Local ML (MediaPipe)
- **Purpose**: Real-time facial expression analysis
- **Capabilities**:
  - Detects engagement states: engaged, distracted, confused
  - Uses Eye Aspect Ratio (EAR) and Mouth Aspect Ratio (MAR)
  - Sends state updates to backend via HTTP
- **Technology**: OpenCV + MediaPipe face mesh

### 4. Database (SQLite)
- **Purpose**: Persistent storage
- **Tables**:
  - `users`: User profiles and difficulty levels
  - `quiz_attempts`: Answer history and performance data

## Data Flow

1. **Content Input**: User provides course transcript
2. **Quiz Generation**: Backend calls Gemini API to create questions
3. **Emotion Monitoring**: ML component analyzes facial expressions
4. **Adaptive Response**: System adjusts based on learner state
5. **Progress Tracking**: Database stores performance metrics

## Integration Points

- **Frontend ↔ Backend**: REST API calls via Axios
- **ML ↔ Backend**: HTTP requests for state updates
- **Backend ↔ Gemini**: API calls for content generation
- **Backend ↔ Database**: SQLAlchemy ORM for data persistence

## Scalability Considerations

- **Horizontal Scaling**: FastAPI supports async operations
- **Database**: Can migrate from SQLite to PostgreSQL
- **ML Processing**: Can be deployed as separate microservice
- **Caching**: Redis can be added for session management