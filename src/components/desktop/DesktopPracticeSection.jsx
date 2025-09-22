import React from "react";
import DesktopRecordingUI from "./DesktopRecordingUI";

const DesktopPracticeSection = ({
  currentSentence,
  isRecording,
  recordingTime,
  speechDetected,
  onListenClick,
  onListenSlowClick,
  onMicClick,
  onStopRecording,
  onPlayRecording,
}) => {
  return (
    <div className="practice-section">
      {/* Arabic Text Container */}
      <div dir="rtl" className="arabic-instruction">
        <p>مرحبا! كيف حالك؟ اضغط على الميكروفون واقرأ الجملة التالية:</p>
      </div>

      {/* English Sentence Container */}
      <div className="sentence-container" id="sentence">
        <p className="sentence-text">{currentSentence?.english}</p>
      </div>

      {/* Arabic Translation */}
      <div className="translation-container" id="translationDiv">
        <p className="translation-text">{currentSentence?.arabic}</p>
      </div>

      {/* Control Icons */}
      <div className="control-icons">
        {/* Listen Button */}
        <button
          className="control-btn listen-btn"
          id="listenButton"
          title="Listen to example"
          onClick={onListenClick}
        >
          <i className="fas fa-volume-up"></i>
        </button>

        {/* Microphone Button */}
        <button
          className={`mic-button ${isRecording ? "recording" : ""}`}
          id="micButton"
          title="Start recording"
          onClick={onMicClick}
        >
          <i className="fas fa-microphone"></i>
        </button>

        {/* Play Recording Button */}
        <button
          className="control-btn play-btn"
          id="bookmarkIcon"
          title="Play recorded audio"
          onClick={onPlayRecording}
        >
          <i className="fas fa-headphones"></i>
        </button>
      </div>

      {/* Recording UI Container */}
      <DesktopRecordingUI
        show={isRecording}
        recordingTime={recordingTime}
        speechDetected={speechDetected}
        onStopRecording={onStopRecording}
      />

      {/* Recording Indicator */}
      <div
        id="recordingIndicator"
        className={`recording-indicator ${isRecording ? "" : "hidden"}`}
      >
        <i className="fas fa-circle recording-dot"></i>
        <span>Recording...</span>
      </div>
    </div>
  );
};

export default DesktopPracticeSection;


