# API Endpoints Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Generate Quiz
**POST** `/generate_quiz`

Generate adaptive quiz questions from course transcript.

**Request Body:**
```json
{
  "transcript": "Course content text...",
  "learner_state": "engaged|distracted|confused",
  "difficulty": "easy|medium|hard"
}
```

**Response:**
```json
{
  "quiz": [
    {
      "question": "What is machine learning?",
      "options": ["A) AI subset", "B) Programming", "C) Database", "D) Network"],
      "answer": "A) AI subset",
      "difficulty": "medium",
      "explanation": "Machine learning is indeed a subset of artificial intelligence..."
    }
  ]
}
```

### 2. Generate Hint
**POST** `/generate_hint`

Get contextual hint for a quiz question.

**Request Body:**
```json
{
  "question": "What is supervised learning?",
  "options": ["A) No labels", "B) With labels", "C) Reinforcement", "D) Clustering"]
}
```

**Response:**
```json
{
  "hint": "Think about what kind of data is used to train the model..."
}
```

### 3. Evaluate Answer
**POST** `/evaluate_answer`

Evaluate user answer and provide explanation.

**Request Body:**
```json
{
  "question": "What is supervised learning?",
  "user_answer": "A) No labels",
  "correct_answer": "B) With labels",
  "user_id": 1
}
```

**Response:**
```json
{
  "explanation": "Supervised learning uses labeled data for training...",
  "follow_up": "Can you name an example of supervised learning?",
  "is_correct": false
}
```

### 4. Get Progress
**GET** `/progress/{user_id}`

Retrieve user learning progress and statistics.

**Response:**
```json
{
  "user_id": 1,
  "total_attempts": 15,
  "correct_attempts": 12,
  "accuracy": 80.0
}
```

### 5. Health Check
**GET** `/`

Check if the API is running.

**Response:**
```json
{
  "message": "Adaptive Learning Platform API is running"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `422`: Validation Error
- `500`: Internal Server Error

## Authentication

Currently, the API does not require authentication. In production, consider implementing:
- JWT tokens for user sessions
- API keys for external integrations
- Rate limiting for abuse prevention