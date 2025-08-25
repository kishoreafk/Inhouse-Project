import requests
import json
import os
from typing import Dict, Any

class AnswerEvaluator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    def evaluate_answer(self, question: str, user_answer: str, correct_answer: str) -> Dict[str, Any]:
        prompt = f"""The learner answered this question incorrectly:
        
        Question: {question}
        User Answer: {user_answer}
        Correct Answer: {correct_answer}
        
        Explain why the user's answer is wrong and provide a clear explanation of the correct concept.
        Then provide a follow-up reinforcement question to help them understand better.
        
        Return JSON in this exact format:
        {{
            "explanation": "Explanation of why the answer is wrong and the correct concept",
            "follow_up": "A follow-up question to reinforce learning",
            "is_correct": false
        }}"""
        
        # Check if answer is correct first
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        
        if is_correct:
            return {
                "explanation": "Correct! Well done.",
                "follow_up": "Ready for the next challenge?",
                "is_correct": True
            }
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Extract JSON from response
                start_idx = content.find("{")
                end_idx = content.rfind("}") + 1
                json_str = content[start_idx:end_idx]
                
                evaluation = json.loads(json_str)
                evaluation["is_correct"] = False
                return evaluation
            else:
                return {"error": f"API request failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Answer evaluation failed: {str(e)}"}