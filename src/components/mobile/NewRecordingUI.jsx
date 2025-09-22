import React from "react";

const NewRecordingUI = ({
  show,
  isRecording,
  recordingTime,
  speechDetected,
  onStartRecording,
  onStopRecording,
  onDeleteRecording,
  onPlayRecording,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!show) return null;

  return (
    <div className="new-recording-container">
      <div className="new-recording-content">
        {/* Waveform Area */}
        <div className="new-waveform-area">
          <div className="new-waveform-bars">
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className="new-waveform-bar"></div>
            ))}
          </div>
          <div className="new-recording-timer">{formatTime(recordingTime)}</div>
        </div>

        {/* Control Buttons */}
        <div className="new-recording-controls">
          {/* Delete Button */}
          <button
            className="new-control-btn new-delete-btn"
            onClick={onDeleteRecording}
            title="Delete recording"
          >
            <i className="fas fa-trash"></i>
          </button>

          {/* Main Record/Stop Button */}
          <button
            className={`new-main-btn ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? onStopRecording : onStartRecording}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            <i
              className={`fas ${isRecording ? "fa-stop" : "fa-microphone"}`}
            ></i>
          </button>

          {/* Play Button */}
          <button
            className="new-control-btn new-play-btn"
            onClick={onPlayRecording}
            title="Play recording"
          >
            <i className="fas fa-play"></i>
          </button>
        </div>

        {/* Status Indicator */}
        {isRecording && (
          <div className="new-recording-status">
            <div
              className={`new-status-dot ${speechDetected ? "active" : ""}`}
            ></div>
            <span>{speechDetected ? "Speaking detected" : "Listening..."}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRecordingUI;


