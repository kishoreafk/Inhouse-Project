from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import threading
import time
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
from transcript_extractor import get_transcript
import json

# Cache for transcripts to avoid re-extraction
transcript_cache = {}

def get_transcript_cached(video_id):
    """
    Get transcript with caching to avoid re-extraction for the same video
    """
    if video_id in transcript_cache:
        print(f"Using cached transcript for video {video_id}")
        return transcript_cache[video_id]

    transcript = get_transcript(video_id)
    transcript_cache[video_id] = transcript
    print(f"Cached new transcript for video {video_id}")
    return transcript

load_dotenv(dotenv_path='smartlearn-lite/.env')

# Configure the Gemini API key
gemini_api_key = os.getenv("VITE_GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=gemini_api_key)

app = Flask(__name__)
CORS(app)


monitoring_active = False
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
cap = None
distraction_log = []
monitor_thread = None

def monitor_user():
    global monitoring_active, distraction_log
    print("Starting camera...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Cannot access camera")
        monitoring_active = False
        return
    
    print("Camera started successfully")
    last_check = time.time()
    
    while monitoring_active:
        ret, frame = cap.read()
        if not ret:
            break
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if time.time() - last_check >= 2:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            status = "ENGAGED" if len(faces) > 0 else "DISTRACTED"
            distraction_log.append({"time": timestamp, "status": status})
            print(f"[{timestamp}] {status}")
            last_check = time.time()
        
        time.sleep(0.1)
    
    if cap:
        cap.release()
        print("Camera released")

@app.route('/start-monitoring', methods=['POST'])
def start_monitoring():
    global monitoring_active, distraction_log, monitor_thread
    
    if not monitoring_active:
        distraction_log = []
        monitoring_active = True
        monitor_thread = threading.Thread(target=monitor_user, daemon=True)
        monitor_thread.start()
        return jsonify({"status": "started"})
    return jsonify({"status": "already running"})

@app.route('/stop-monitoring', methods=['POST'])
def stop_monitoring():
    global monitoring_active, monitor_thread
    monitoring_active = False
    if monitor_thread:
        monitor_thread.join(timeout=2)
    return jsonify({"status": "stopped", "log": distraction_log})

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({"monitoring": monitoring_active, "recent_logs": distraction_log[-10:]})

quiz_sessions = {}

@app.route('/get-quiz', methods=['GET'])
def get_quiz():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        transcript = get_transcript_cached(video_id)
        if not transcript or transcript.startswith("Could not retrieve"):
            return jsonify({"error": "Failed to retrieve transcript"}), 500

        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Generate 5 multiple-choice questions from this learning material:
        {transcript}
        Return a valid JSON array, where each object has "question", "options" (an array of 4 strings), "answer" (one of the options), and "hint" (a helpful clue without giving away the answer):
        [
            {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "hint": "..."}},
            ...
        ]
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        json_match = response_text[response_text.find('['):response_text.rfind(']')+1]
        
        if not json_match:
            return jsonify({"error": "Failed to generate a valid quiz from the model"}), 500
            
        quiz_data = json.loads(json_match)
        session_id = f"{video_id}_{int(time.time())}"
        quiz_sessions[session_id] = {"questions": quiz_data, "current": 0}
        
        return jsonify({
            "sessionId": session_id,
            "totalQuestions": len(quiz_data),
            "question": quiz_data[0]["question"],
            "options": quiz_data[0]["options"],
            "questionNumber": 1
        })

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": "An internal error occurred while generating the quiz"}), 500

@app.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json
    session_id = data.get('sessionId')
    answer = data.get('answer')
    
    if not session_id or session_id not in quiz_sessions:
        return jsonify({"error": "Invalid session"}), 400
    
    session = quiz_sessions[session_id]
    current_q = session["questions"][session["current"]]
    correct = answer == current_q["answer"]
    
    response = {"correct": correct}
    if not correct:
        response["hint"] = current_q.get("hint", "Review the material and try again.")
    
    return jsonify(response)

@app.route('/next-question', methods=['POST'])
def next_question():
    data = request.json
    session_id = data.get('sessionId')

    if not session_id or session_id not in quiz_sessions:
        return jsonify({"error": "Invalid session"}), 400

    session = quiz_sessions[session_id]
    session["current"] += 1

    if session["current"] >= len(session["questions"]):
        return jsonify({"completed": True})

    current_q = session["questions"][session["current"]]
    return jsonify({
        "question": current_q["question"],
        "options": current_q["options"],
        "questionNumber": session["current"] + 1,
        "totalQuestions": len(session["questions"])
    })

@app.route('/summarize', methods=['GET'])
def summarize():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        transcript = get_transcript_cached(video_id)
        if not transcript or transcript.startswith("Could not retrieve"):
            return jsonify({"error": "Failed to retrieve transcript"}), 500

        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Please provide a concise summary of the following video transcript in 2-3 paragraphs.
        Focus on the main topics and key insights discussed.

        Transcript: {transcript}

        Summary:
        """

        response = model.generate_content(prompt)
        summary = response.text.strip()

        return jsonify({"summary": summary})

    except Exception as e:
        print(f"Error generating summary: {e}")
        return jsonify({"error": "An internal error occurred while generating the summary"}), 500

@app.route('/key-points', methods=['GET'])
def get_key_points():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        transcript = get_transcript_cached(video_id)
        if not transcript or transcript.startswith("Could not retrieve"):
            return jsonify({"error": "Failed to retrieve transcript"}), 500

        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Extract the key learning points from this video transcript.
        Provide them as a bullet-point list (5-8 points) that captures the most important concepts and insights.

        Transcript: {transcript}

        Key Points:
        """

        response = model.generate_content(prompt)
        key_points = response.text.strip()

        return jsonify({"keyPoints": key_points})

    except Exception as e:
        print(f"Error generating key points: {e}")
        return jsonify({"error": "An internal error occurred while generating key points"}), 500

@app.route('/ask-question', methods=['POST'])
def ask_question():
    data = request.json
    video_id = data.get('videoId')
    question = data.get('question')

    if not video_id or not question:
        return jsonify({"error": "Missing videoId or question parameter"}), 400

    try:
        transcript = get_transcript_cached(video_id)
        if not transcript or transcript.startswith("Could not retrieve"):
            return jsonify({"error": "Failed to retrieve transcript"}), 500

        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Based on the following video transcript, please answer this question: "{question}"

        Provide a clear, concise, and accurate answer based on the content of the transcript.
        If the question cannot be answered using the transcript, politely explain that.

        Transcript: {transcript}

        Answer:
        """

        response = model.generate_content(prompt)
        answer = response.text.strip()

        return jsonify({"answer": answer})

    except Exception as e:
        print(f"Error answering question: {e}")
        return jsonify({"error": "An internal error occurred while processing your question"}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)
