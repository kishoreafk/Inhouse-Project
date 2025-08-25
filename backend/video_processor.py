import speech_recognition as sr
from moviepy.editor import VideoFileClip
import tempfile
import os
import requests
from typing import Optional, List, Dict
from urllib.parse import urlparse, parse_qs
import yt_dlp
import subprocess
import time
from youtube_transcript_api import YouTubeTranscriptApi
import re

# Configure moviepy to use imageio-ffmpeg
try:
    import imageio_ffmpeg as ffmpeg
    os.environ['IMAGEIO_FFMPEG_EXE'] = ffmpeg.get_ffmpeg_exe()
except ImportError:
    ffmpeg = None  # type: ignore


def _get_cookiefile_path() -> Optional[str]:
    """Return path to cookies.txt if provided via env or local file."""
    env_path = os.getenv("YTDLP_COOKIES", "").strip()
    if env_path and os.path.exists(env_path):
        return env_path
    local_path = os.path.join(os.path.dirname(__file__), "cookies.txt")
    if os.path.exists(local_path):
        return local_path
    return None


def _get_ffmpeg_location() -> Optional[str]:
    """Return ffmpeg binary path if available (for yt-dlp postprocessing)."""
    try:
        # Prefer imageio-ffmpeg if available
        if ffmpeg is not None:
            return ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    # Fallback: None lets yt-dlp search PATH
    return None


class VideoProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def validate_video_file(self, video_path: str) -> bool:
        """Validate video file integrity"""
        try:
            if not os.path.exists(video_path):
                return False

            file_size = os.path.getsize(video_path)
            if file_size < 1024:  # Less than 1KB
                print(f"Video file too small: {file_size} bytes")
                return False

            # Try to open with moviepy to check if readable
            video = VideoFileClip(video_path)
            duration = video.duration
            video.close()

            if duration is None or duration <= 0:
                print("Invalid video duration")
                return False

            print(f"Video validated: {file_size} bytes, {duration:.1f}s")
            return True

        except Exception as e:
            print(f"Video validation failed: {str(e)}")
            return False

    def extract_audio_from_video(self, video_path: str) -> str:
        """Extract audio from video file with validation"""
        try:
            print("Validating video file...")
            if not self.validate_video_file(video_path):
                raise Exception("Invalid or corrupted video file")

            print("Extracting audio from video...")
            video = VideoFileClip(video_path)

            if video.audio is None:
                video.close()
                raise Exception("No audio track found in video")

            # Create temporary audio file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                audio_path = temp_audio.name

            # Extract audio with lower quality for speed
            print(f"Video duration: {video.duration:.1f} seconds")
            video.audio.write_audiofile(
                audio_path,
                verbose=False,
                logger=None,
                bitrate="64k",
                fps=16000,
            )
            video.close()
            print("Audio extraction completed")

            return audio_path
        except Exception as e:
            raise Exception(f"Audio extraction failed: {str(e)}")

    def transcribe_audio(self, audio_path: str) -> str:
        """Convert audio to text using speech recognition with chunking"""
        try:
            print("Starting audio transcription...")
            with sr.AudioFile(audio_path) as source:
                duration = source.DURATION
                print(f"Audio duration: {duration:.1f} seconds")

                # Process in chunks for better performance
                chunk_length = 30  # 30 second chunks
                transcripts: List[str] = []

                for i in range(0, int(duration), chunk_length):
                    end_time = min(i + chunk_length, duration)
                    print(f"Processing chunk {i//chunk_length + 1}: {i}s-{end_time}s")

                    audio = self.recognizer.record(source, duration=chunk_length, offset=i)

                    try:
                        chunk_transcript = self.recognizer.recognize_google(audio)
                        transcripts.append(chunk_transcript)
                        print(f"Chunk transcribed: {len(chunk_transcript)} characters")
                    except sr.UnknownValueError:
                        print(f"Could not understand chunk {i//chunk_length + 1}")
                        continue

                transcript = " ".join(transcripts)
                print(f"Transcription completed: {len(transcript)} total characters")
                return transcript

        except sr.RequestError as e:
            raise Exception(f"Speech recognition error: {str(e)}")

    def process_video(self, video_path: str, existing_transcript: Optional[str] = None) -> str:
        """Process video to get transcript"""
        if existing_transcript and existing_transcript.strip():
            return existing_transcript

        # Extract transcript from video
        audio_path = self.extract_audio_from_video(video_path)
        transcript = self.transcribe_audio(audio_path)

        return transcript

    def progress_hook(self, d):
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', 'N/A')
            speed = d.get('_speed_str', 'N/A')
            print(f"Download progress: {percent} at {speed}")
        elif d['status'] == 'finished':
            print(f"Download completed: {d['filename']}")

    def _base_ytdlp_opts(self) -> Dict:
        cookiefile = _get_cookiefile_path()
        ffmpeg_location = _get_ffmpeg_location()
        opts: Dict = {
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'geo_bypass': True,
            'retries': 3,
            'fragment_retries': 3,
            'progress_hooks': [self.progress_hook],
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com',
            },
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web']  # helps avoid some 403/signature issues
                }
            },
        }
        if cookiefile:
            opts['cookiefile'] = cookiefile
        if ffmpeg_location:
            opts['ffmpeg_location'] = ffmpeg_location
        return opts

    def extract_audio_only_youtube(self, url: str) -> str:
        """Extract audio directly from YouTube without downloading video"""
        audio_path = None
        try:
            print("Attempting direct audio extraction...")

            temp_fd, audio_path = tempfile.mkstemp(suffix=".wav")
            os.close(temp_fd)

            ydl_opts = self._base_ytdlp_opts()
            ydl_opts.update({
                'format': 'bestaudio/best',
                'outtmpl': audio_path.replace('.wav', '.%(ext)s'),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                    'preferredquality': '64',
                }],
            })

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

            if os.path.exists(audio_path) and os.path.getsize(audio_path) > 1024:
                print(f"Direct audio extraction successful: {os.path.getsize(audio_path)} bytes")
                return audio_path
            else:
                raise Exception("Audio file not created or too small")

        except Exception as e:
            if audio_path and os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except Exception:
                    pass
            raise Exception(f"Direct audio extraction failed: {str(e)}")

    def download_youtube_video(self, url: str) -> str:
        """Download YouTube video with validation and fallback"""
        video_path = None
        try:
            # Create temp file with proper extension
            temp_fd, video_path = tempfile.mkstemp(suffix=".%(ext)s")
            os.close(temp_fd)

            # Try multiple format options
            format_options = [
                'best[height<=480][ext=mp4]/best[ext=mp4]',
                'worst[height<=360][ext=mp4]/worst[ext=mp4]',
                'best[height<=720]/best',
                'worst'
            ]

            for format_opt in format_options:
                try:
                    print(f"Trying format: {format_opt}")

                    ydl_opts = self._base_ytdlp_opts()
                    ydl_opts.update({
                        'format': format_opt,
                        'outtmpl': video_path,
                        'writeinfojson': False,
                        'writedescription': False,
                        'writesubtitles': False,
                    })

                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([url])

                    # Validate downloaded file
                    if self.validate_video_file(video_path):
                        print(f"Successfully downloaded with format: {format_opt}")
                        return video_path
                    else:
                        print(f"Downloaded file invalid with format: {format_opt}")
                        if os.path.exists(video_path):
                            os.remove(video_path)
                        continue

                except Exception as e:
                    print(f"Format {format_opt} failed: {str(e)}")
                    if os.path.exists(video_path):
                        try:
                            os.remove(video_path)
                        except Exception:
                            pass
                    continue

            raise Exception("All download formats failed")

        except Exception as e:
            if video_path and os.path.exists(video_path):
                try:
                    os.remove(video_path)
                except Exception:
                    pass
            raise Exception(f"YouTube video download failed: {str(e)}")

    def get_youtube_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/|v\/|youtu\.be\/)([0-9A-Za-z_-]{11})'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        raise Exception("Could not extract video ID from URL")

    def get_youtube_transcript(self, url: str) -> str:
        """Get transcript using YouTube Transcript API"""
        try:
            video_id = self.get_youtube_video_id(url)
            print(f"Fetching transcript for video ID: {video_id}")

            transcript_list = YouTubeTranscriptApi.get_transcript(
                video_id, languages=['en', 'en-US', 'en-GB']
            )
            transcript = ' '.join([item['text'] for item in transcript_list])

            print(f"Transcript fetched: {len(transcript)} characters")
            return transcript

        except Exception as e:
            raise Exception(f"YouTube transcript fetch failed: {str(e)}")

    def _parse_vtt_to_text(self, vtt_content: str) -> str:
        """Very simple WebVTT to plain text converter."""
        lines = []
        for raw_line in vtt_content.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            # Skip WEBVTT header and timestamps/cue settings
            if line.upper().startswith('WEBVTT'):
                continue
            if re.match(r"^\d{2,}:\d{2}:\d{2}\.\d{3} --> ", line) or re.match(r"^\d{1,2}:\d{2}\.\d{3} --> ", line):
                continue
            if re.match(r"^\d+$", line):  # cue number
                continue
            # Remove basic HTML tags
            text = re.sub(r"<[^>]+>", "", line)
            lines.append(text)
        return " ".join(lines)

    def get_youtube_transcript_via_ytdlp(self, url: str) -> str:
        """Try fetching subtitles/auto-captions via yt-dlp without downloading media."""
        try:
            ydl_opts = self._base_ytdlp_opts()
            ydl_opts.update({'skip_download': True})
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

            lang_prefs = ['en', 'en-US', 'en-GB']
            # Prefer manual subtitles; fallback to automatic captions
            subs = info.get('subtitles') or {}
            autos = info.get('automatic_captions') or {}

            def pick_track(caps: Dict[str, List[Dict]]) -> Optional[Dict]:
                for lang in lang_prefs:
                    if lang in caps and caps[lang]:
                        # Prefer vtt if present
                        tracks = caps[lang]
                        vtt = next((t for t in tracks if t.get('ext') == 'vtt'), None)
                        return vtt or tracks[0]
                # fallback: any language
                for _, tracks in caps.items():
                    if tracks:
                        vtt = next((t for t in tracks if t.get('ext') == 'vtt'), None)
                        return vtt or tracks[0]
                return None

            track = pick_track(subs) or pick_track(autos)
            if not track or not track.get('url'):
                raise Exception('No subtitle tracks available')

            r = requests.get(track['url'], timeout=30)
            r.raise_for_status()
            content = r.text
            if track.get('ext') == 'vtt' or content.startswith('WEBVTT'):
                text = self._parse_vtt_to_text(content)
            else:
                # Fallback: raw text
                text = content

            if not text.strip():
                raise Exception('Empty caption text')

            print(f"Fetched captions via yt-dlp: {len(text)} characters")
            return text
        except Exception as e:
            raise Exception(f"yt-dlp captions fetch failed: {str(e)}")

    def process_video_url(self, url: str) -> str:
        """Process video from URL to get transcript with fallback methods"""
        video_path: Optional[str] = None
        audio_path: Optional[str] = None

        try:
            print(f"Starting video processing for: {url}")

            if 'youtube.com' in url or 'youtu.be' in url:
                # Method 1: Try YouTube Transcript API first (fastest)
                try:
                    print("Method 1: YouTube Transcript API...")
                    return self.get_youtube_transcript(url)
                except Exception as e:
                    print(f"Transcript API failed: {str(e)}")

                # Method 1b: Try captions via yt-dlp (manual/auto)
                try:
                    print("Method 1b: Captions via yt-dlp...")
                    return self.get_youtube_transcript_via_ytdlp(url)
                except Exception as e:
                    print(f"yt-dlp captions failed: {str(e)}")

                # Method 2: Try direct audio extraction
                try:
                    print("Method 2: Direct audio extraction...")
                    audio_path = self.extract_audio_only_youtube(url)
                    transcript = self.transcribe_audio(audio_path)
                    print("Direct audio method successful")
                    return transcript

                except Exception as e:
                    print(f"Direct audio method failed: {str(e)}")
                    if audio_path and os.path.exists(audio_path):
                        try:
                            os.remove(audio_path)
                        except Exception:
                            pass
                    audio_path = None

                # Method 3: Download video then extract audio
                try:
                    print("Method 3: Video download and extraction...")
                    start_time = time.time()
                    video_path = self.download_youtube_video(url)
                    download_time = time.time() - start_time
                    print(f"Download completed in {download_time:.1f} seconds")

                    process_start = time.time()
                    transcript = self.process_video(video_path)
                    process_time = time.time() - process_start
                    print(f"Processing completed in {process_time:.1f} seconds")

                    return transcript

                except Exception as e:
                    print(f"Video download method failed: {str(e)}")
                    hint = ""
                    if _get_cookiefile_path() is None:
                        hint = " Hint: provide a cookies.txt via env YTDLP_COOKIES or backend/cookies.txt to bypass 403/age/region blocks."
                    raise Exception(f"All YouTube processing methods failed. Last error: {str(e)}{hint}")

            else:
                print("Processing non-YouTube URL...")
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
                    temp_video_path = temp_video.name

                response = requests.get(url, stream=True, timeout=30)
                response.raise_for_status()

                with open(temp_video_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                transcript = self.process_video(temp_video_path)
                os.remove(temp_video_path)
                return transcript

        except Exception as e:
            print(f"Error in process_video_url: {str(e)}")
            raise Exception(f"Video processing failed: {str(e)}")

        finally:
            for path in [video_path, audio_path]:
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                        print(f"Cleaned up: {path}")
                    except Exception as cleanup_error:
                        print(f"Cleanup failed for {path}: {cleanup_error}")
