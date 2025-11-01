import cv2
import time
from datetime import datetime

def log_status(status):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] User is {status}")

def check_engagement(face_detected, eyes_open=True):
    if not face_detected:
        return "DISTRACTED - No face detected"
    elif not eyes_open:
        return "DISTRACTED - Eyes closed"
    else:
        return "ENGAGED"

def main():
    # Request camera permission
    print("Requesting camera access...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Camera access denied or not available")
        return
    
    print("Camera access granted. Starting monitoring...")
    
    # Load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    last_log_time = time.time()
    log_interval = 2  # Log every 2 seconds
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            # Check engagement
            face_detected = len(faces) > 0
            status = check_engagement(face_detected)
            
            # Log status at intervals
            current_time = time.time()
            if current_time - last_log_time >= log_interval:
                log_status(status)
                last_log_time = current_time
            
            # Display video (optional)
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow('User Monitor', frame)
            
            # Press 'q' to quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Camera released")

if __name__ == "__main__":
    main()
