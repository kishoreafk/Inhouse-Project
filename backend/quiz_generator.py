from requests import post
from json import loads, JSONDecodeError
from os import getenv
from typing import Dict, Any

class QuizGenerator:
    def __init__(self):
        self.api_key = getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    def generate_quiz(self, transcript: str, learner_state: str, difficulty: str = "medium") -> Dict[str, Any]:
        if not transcript or not transcript.strip():
            return {"error": "Transcript cannot be empty"}
        if not learner_state or not learner_state.strip():
            return {"error": "Learner state cannot be empty"}
        prompt = f"""Generate 3 multiple-choice questions and 1 open-ended question from this transcript.
        Learner state: {learner_state}
        Difficulty: {difficulty}
        
        Transcript: {transcript}
        
        Return JSON in this exact format:
        {{
            "quiz": [
                {{
                    "question": "Question text here",
                    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
                    "answer": "A) Option 1",
                    "difficulty": "{difficulty}",
                    "explanation": "Explanation of the correct answer"
                }}
            ]
        }}"""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = post(
                self.base_url,
                headers={**headers, "Authorization": f"Bearer {self.api_key}"},
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Extract JSON from response
                start_idx = content.find("{")
                end_idx = content.rfind("}") + 1
                
                if start_idx == -1 or end_idx == 0:
                    return {"error": "No valid JSON found in response"}
                
                json_str = content[start_idx:end_idx]
                
                try:
                    return loads(json_str)
                except JSONDecodeError as e:
                    return {"error": f"Invalid JSON in response: {str(e)}"}
            else:
                return {"error": f"API request failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Quiz generation failed: {str(e)}"}