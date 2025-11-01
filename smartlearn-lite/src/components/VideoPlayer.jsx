import { useRef, forwardRef, useImperativeHandle } from "react";
import YouTube from "react-youtube";

const VideoPlayer = forwardRef(({ url, onProgress, onPlay, onPause, onVideoLoaded }, ref) => {
  const playerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (playerRef.current) {
        // For HTML5 video
        if (typeof playerRef.current.pause === "function") {
          playerRef.current.pause();
        }
        // For YouTube player
        else if (typeof playerRef.current.pauseVideo === "function") {
          playerRef.current.pauseVideo();
        }
      }
    },
  }));

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const isBlob = url.startsWith("blob:");
  const isVideoFile = /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
  const youtubeId = getYouTubeId(url);

  const youtubeOpts = {
    height: "480",
    width: "100%",
    playerVars: {
      autoplay: 0,
      origin: window.location.origin,
    },
  };

  const handleYouTubeReady = (event) => {
    playerRef.current = event.target;
    onVideoLoaded(event);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
      {isBlob || isVideoFile ? (
        <video
          ref={playerRef}
          src={url}
          controls
          width="100%"
          height="480"
          onLoadedData={onVideoLoaded}
          onTimeUpdate={(e) => onProgress?.(e.target.currentTime)}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onPause}
          style={{ backgroundColor: "black" }}
        />
      ) : youtubeId ? (
        <YouTube
          videoId={youtubeId}
          opts={youtubeOpts}
          onReady={handleYouTubeReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onPause}
          className="w-full h-[480px]"
        />
      ) : (
        <div className="bg-gray-900 text-white p-8 text-center" style={{ height: "480px" }}>
          <p>Invalid video URL</p>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
