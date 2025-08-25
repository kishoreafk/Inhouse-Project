from pydantic import BaseModel
from typing import List, Optional
from fastapi import UploadFile

class VideoRequest(BaseModel):
    transcript: Optional[str] = None
    learner_state: str = "engaged"
    difficulty: Optional[str] = "medium"

class VideoUrlRequest(BaseModel):
    url: str

class HintRequest(BaseModel):
    question: str
    options: Optional[List[str]] = None

class EvaluateRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str

class QuizResponse(BaseModel):
    quiz: List[QuizQuestion]

class HintResponse(BaseModel):
    hint: str

class EvaluationResponse(BaseModel):
    explanation: str
    follow_up: str
    is_correct: bool

class TranscriptResponse(BaseModel):
    transcript: str