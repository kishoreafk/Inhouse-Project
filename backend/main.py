from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

from models import *
from quiz_generator import QuizGenerator
from hint_generator import HintGenerator
from evaluator import AnswerEvaluator
from video_processor import VideoProcessor

load_dotenv()

app = FastAPI(title="Adaptive Learning Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
quiz_gen = QuizGenerator()
hint_gen = HintGenerator()
evaluator = AnswerEvaluator()
video_processor = VideoProcessor()

@app.post("/upload_video", response_model=TranscriptResponse)
async def upload_video(video: UploadFile = File(...), transcript: str = Form(None)):
    temp_video_path = None
    try:
        # Save uploaded video temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            content = await video.read()
            temp_video.write(content)
            temp_video_path = temp_video.name
        
        # Process video to get transcript
        final_transcript = video_processor.process_video(temp_video_path, transcript)
        
        return TranscriptResponse(transcript=final_transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up
        if temp_video_path and os.path.exists(temp_video_path):
            try:
                os.unlink(temp_video_path)
            except Exception:
                pass

@app.post("/process_video_url", response_model=TranscriptResponse)
async def process_video_url(request: VideoUrlRequest):
    try:
        print(f"Processing video URL: {request.url}")
        
        # Process video from URL to get transcript
        final_transcript = video_processor.process_video_url(request.url)
        
        print(f"Successfully processed video, transcript length: {len(final_transcript)}")
        return TranscriptResponse(transcript=final_transcript)
    except Exception as e:
        print(f"Error processing video URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")

@app.post("/generate_quiz", response_model=QuizResponse)
async def generate_quiz(request: VideoRequest):
    try:
        result = quiz_gen.generate_quiz(
            transcript=request.transcript,
            learner_state=request.learner_state,
            difficulty=request.difficulty
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return QuizResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_hint", response_model=HintResponse)
async def generate_hint(request: HintRequest):
    try:
        result = hint_gen.generate_hint(
            question=request.question,
            options=request.options
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return HintResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate_answer", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluateRequest):
    try:
        result = evaluator.evaluate_answer(
            question=request.question,
            user_answer=request.user_answer,
            correct_answer=request.correct_answer
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return EvaluationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Adaptive Learning Platform API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)