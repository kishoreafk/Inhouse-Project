import requests
import json
import os
from typing import Dict, Any, List, Optional

class HintGenerator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    def generate_hint(self, question: str, options: Optional[List[str]] = None) -> Dict[str, Any]:
        options_text = f"\nOptions: {', '.join(options)}" if options else ""
        
        prompt = f"""Provide a helpful hint for this question without revealing the answer directly.
        The hint should guide the learner's thinking process.
        
        Question: {question}{options_text}
        
        Return JSON in this exact format:
        {{
            "hint": "Your helpful hint here"
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
                
                return json.loads(json_str)
            else:
                return {"error": f"API request failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Hint generation failed: {str(e)}"}