import cv2
import mediapipe as mp
import numpy as np
import requests
import time
from typing import Dict, Tuple

class EmotionDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Key facial landmarks for emotion detection
        self.LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.MOUTH = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]
        
        self.backend_url = "http://localhost:8000"
        
    def calculate_ear(self, eye_landmarks) -> float:
        """Calculate Eye Aspect Ratio"""
        # Vertical eye landmarks
        A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
        # Horizontal eye landmark
        C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
        
        ear = (A + B) / (2.0 * C)
        return ear
    
    def calculate_mar(self, mouth_landmarks) -> float:
        """Calculate Mouth Aspect Ratio"""
        # Vertical mouth landmarks
        A = np.linalg.norm(mouth_landmarks[2] - mouth_landmarks[10])
        B = np.linalg.norm(mouth_landmarks[4] - mouth_landmarks[8])
        C = np.linalg.norm(mouth_landmarks[3] - mouth_landmarks[9])
        
        # Horizontal mouth landmarks
        D = np.linalg.norm(mouth_landmarks[0] - mouth_landmarks[6])
        E = np.linalg.norm(mouth_landmarks[1] - mouth_landmarks[7])
        
        mar = (A + B + C) / (3.0 * (D + E) / 2.0)
        return mar
    
    def detect_emotion_state(self, landmarks) -> str:
        """Detect learner state based on facial landmarks"""
        try:
            # Extract eye landmarks
            left_eye = np.array([(landmarks[i].x, landmarks[i].y) for i in self.LEFT_EYE[:6]])
            right_eye = np.array([(landmarks[i].x, landmarks[i].y) for i in self.RIGHT_EYE[:6]])
            mouth = np.array([(landmarks[i].x, landmarks[i].y) for i in self.MOUTH])
            
            # Calculate ratios
            left_ear = self.calculate_ear(left_eye)
            right_ear = self.calculate_ear(right_eye)
            avg_ear = (left_ear + right_ear) / 2.0
            
            mar = self.calculate_mar(mouth)
            
            # Determine state based on thresholds
            if avg_ear < 0.2:  # Eyes mostly closed
                return "distracted"
            elif mar > 0.05:  # Mouth open (confused/surprised)
                return "confused"
            else:
                return "engaged"
                
        except Exception as e:
            print(f"Error in emotion detection: {e}")
            return "engaged"
    
    def send_state_to_backend(self, state: str):
        """Send learner state to backend"""
        try:
            response = requests.post(
                f"{self.backend_url}/learner_state",
                json={"state": state, "timestamp": time.time()},
                timeout=1
            )
            if response.status_code == 200:
                print(f"State sent: {state}")
        except requests.exceptions.RequestException:
            pass  # Backend might not be running
    
    def run_detection(self):
        """Main detection loop"""
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Could not open webcam")
            return
        
        print("Starting emotion detection... Press 'q' to quit")
        
        frame_count = 0
        state_history = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process frame
            results = self.face_mesh.process(rgb_frame)
            
            current_state = "no_face"
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    # Draw face mesh
                    self.mp_drawing.draw_landmarks(
                        frame, face_landmarks, self.mp_face_mesh.FACEMESH_CONTOURS,
                        None, self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1)
                    )
                    
                    # Detect emotion state
                    current_state = self.detect_emotion_state(face_landmarks.landmark)
            
            # Track state history
            state_history.append(current_state)
            if len(state_history) > 30:  # Keep last 30 frames (1 second at 30fps)
                state_history.pop(0)
            
            # Send state every 60 frames (2 seconds)
            if frame_count % 60 == 0 and state_history:
                # Get most common state in recent history
                most_common_state = max(set(state_history), key=state_history.count)
                self.send_state_to_backend(most_common_state)
            
            # Display state on frame
            cv2.putText(frame, f"State: {current_state}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            cv2.imshow('Emotion Detection', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            frame_count += 1
        
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    detector = EmotionDetector()
    detector.run_detection()