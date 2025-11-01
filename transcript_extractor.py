import os
from youtube_transcript_api import YouTubeTranscriptApi
from yt_dlp import YoutubeDL
from pytube import YouTube
import youtube_dl

def get_transcript_youtube_transcript_api(video_id):
    """
    Method 1: Using youtube-transcript-api
    """
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([d['text'] for d in transcript_list])
        return transcript
    except Exception as e:
        print(f"youtube-transcript-api failed: {e}")
        return None

def get_transcript_yt_dlp(video_url):
    """
    Method 2: Using yt-dlp
    """
    try:
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'skip_download': True,
            'subtitleslangs': ['en'],
            'outtmpl': 'subtitles',
            'quiet': True,
        }
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        if os.path.exists('subtitles.en.vtt'):
            with open('subtitles.en.vtt', 'r', encoding='utf-8') as f:
                # Basic VTT parsing, can be improved
                lines = f.readlines()
                transcript_lines = []
                for line in lines:
                    if '-->' not in line and not line.strip().isdigit() and line.strip() != 'WEBVTT' and line.strip():
                        transcript_lines.append(line.strip())
                return " ".join(transcript_lines)
    except Exception as e:
        print(f"yt-dlp failed: {e}")
    finally:
        if os.path.exists('subtitles.en.vtt'):
            os.remove('subtitles.en.vtt')
    return None

def get_transcript_pytube(video_url):
    """
    Method 3: Using pytube
    """
    try:
        yt = YouTube(video_url)
        caption = yt.captions.get_by_language_code('en')
        if caption:
            return caption.generate_srt_captions()
    except Exception as e:
        print(f"pytube failed: {e}")
    return None

def get_transcript_youtube_dl(video_url):
    """
    Method 4: Using youtube-dl (older)
    """
    try:
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'skip_download': True,
            'subtitleslangs': ['en'],
            'outtmpl': 'subtitles',
            'quiet': True,
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        if os.path.exists('subtitles.en.vtt'):
            with open('subtitles.en.vtt', 'r', encoding='utf-8') as f:
                lines = f.readlines()
                transcript_lines = []
                for line in lines:
                    if '-->' not in line and not line.strip().isdigit() and line.strip() != 'WEBVTT' and line.strip():
                        transcript_lines.append(line.strip())
                return " ".join(transcript_lines)
    except Exception as e:
        print(f"youtube-dl failed: {e}")
    finally:
        if os.path.exists('subtitles.en.vtt'):
            os.remove('subtitles.en.vtt')
    return None


def get_transcript(video_id):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    print("Attempting with yt-dlp...")
    transcript = get_transcript_yt_dlp(video_url)
    if transcript:
        return transcript
        
    print("Attempting with youtube-transcript-api...")
    transcript = get_transcript_youtube_transcript_api(video_id)
    if transcript:
        return transcript

    print("Attempting with pytube...")
    transcript = get_transcript_pytube(video_url)
    if transcript:
        return transcript
        
    print("Attempting with youtube-dl...")
    transcript = get_transcript_youtube_dl(video_url)
    if transcript:
        return transcript
        
    return "Could not retrieve transcript for this video."

if __name__ == '__main__':
    # Example usage:
    video_id = "dQw4w9WgXcQ" # Rick Astley - Never Gonna Give You Up
    transcript = get_transcript(video_id)
    print("\n--- Transcript ---")
    print(transcript)
