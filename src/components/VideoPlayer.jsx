import { useState, useRef, useEffect } from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoSrc, sentence }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    video.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          className="lesson-video"
          src={videoSrc}
          preload="metadata"
          playsInline
        >
          Your browser does not support the video tag.
        </video>

        {showSubtitles && sentence && (
          <div className="subtitle-container">
            <div className="subtitle-content">
              <div className="subtitle-english">{sentence.english}</div>
              <div className="subtitle-arabic">{sentence.arabic}</div>
            </div>
          </div>
        )}
      </div>

      <div className="video-controls">
        <button className="control-btn play-btn" onClick={togglePlay}>
          <i className={`fas fa-${isPlaying ? "pause" : "play"}`}></i>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <div className="progress-container" onClick={handleSeek}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <button
          className="control-btn subtitle-btn"
          onClick={() => setShowSubtitles(!showSubtitles)}
        >
          <i className="fas fa-closed-captioning"></i>
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;

