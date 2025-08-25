import cv2
import threading
import time
from emotion_detector import EmotionDetector

class WebcamStream:
    def __init__(self):
        self.detector = EmotionDetector()
        self.running = False
        self.thread = None
    
    def start_stream(self):
        """Start the webcam stream in a separate thread"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._stream_loop)
            self.thread.daemon = True
            self.thread.start()
            print("Webcam stream started")
    
    def stop_stream(self):
        """Stop the webcam stream"""
        self.running = False
        if self.thread:
            self.thread.join()
        print("Webcam stream stopped")
    
    def _stream_loop(self):
        """Main streaming loop"""
        try:
            self.detector.run_detection()
        except Exception as e:
            print(f"Error in webcam stream: {e}")
        finally:
            self.running = False

def main():
    stream = WebcamStream()
    
    try:
        stream.start_stream()
        
        # Keep the main thread alive
        while stream.running:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        stream.stop_stream()

if __name__ == "__main__":
    main()