import React from "react";

const DesktopVideoSection = ({
  videoRef,
  isPlaying,
  currentTime,
  duration,
  isLoading,
  hasError,
  onPlay,
  onReplay,
  onLoadedMetadata,
  onTimeUpdate,
  onPlayEvent,
  onPause,
  onEnded,
  onError,
  onLoadStart,
  onCanPlay,
  currentSentence,
}) => {
  return (
    <div className="watch-learn-section">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-play-circle"></i>
        </div>
        <h3>Watch & Learn</h3>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <video
          ref={videoRef}
          className="lesson-video"
          controls
          id="lessonVideo"
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlayEvent}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onLoadStart={onLoadStart}
          onCanPlay={onCanPlay}
        >
          <source src={currentSentence?.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Desktop Subtitle System */}
        <div className="subtitle-container" id="desktopSubtitleContainer">
          <div className="subtitle-content">
            <div className="subtitle-english" id="desktopSubtitleEnglish">
              {currentSentence?.english}
            </div>
            <div className="subtitle-arabic" id="desktopSubtitleArabic">
              {currentSentence?.arabic}
            </div>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        <button className="btn btn-outline-primary" onClick={onPlay}>
          <i className="fas fa-play"></i> Watch Video
        </button>
        <button className="btn btn-outline-secondary" onClick={onReplay}>
          <i className="fas fa-redo"></i> Replay
        </button>
      </div>
    </div>
  );
};

export default DesktopVideoSection;


