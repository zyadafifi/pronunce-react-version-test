import React, { useEffect } from "react";

const MobileRecordingUI = ({
  show,
  recordingTime,
  speechDetected,
  onStopRecording,
  onPlayRecording,
  onDeleteRecording,
  isProcessing = false,
  pronunciationScore = null,
  transcription = null,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Reset waveform bars when component mounts (like records.js)
  useEffect(() => {
    console.log("MobileRecordingUI useEffect - show:", show);
    if (show) {
      console.log("MobileRecordingUI is now visible, resetting waveform bars");
      const waveformBars = document.querySelectorAll(".mobile-waveform-bar");
      console.log("Found waveform bars:", waveformBars.length);
      waveformBars.forEach((bar) => {
        bar.style.height = "6px";
        bar.classList.remove("active");
      });
    }
  }, [show]);

  return (
    <div className={`mobile-recording-ui ${show ? "show" : ""}`}>
      <div className="mobile-waveform-container">
        {/* Left pause/delete button */}
        <button
          className="mobile-pause-btn"
          id="mobileDeleteBtn"
          title="Delete recording"
          onClick={onDeleteRecording}
        >
          <i className="fa-regular fa-trash-can"></i>
        </button>

        {/* Center waveform area */}
        <div className="mobile-waveform-area">
          {/* Waveform bars */}
          <div className="mobile-waveform-bars" id="mobileWaveformBars">
            {/* Generate 25 bars for optimal visual effect */}
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className="mobile-waveform-bar"></div>
            ))}
          </div>

          {/* Timer or Processing/Results */}
          <div className="mobile-recording-timer" id="mobileRecordingTimer">
            {isProcessing ? (
              <div className="processing-message">
                <div className="dots-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Processing...</span>
              </div>
            ) : pronunciationScore ? (
              <div
                style={{
                  color:
                    pronunciationScore.score >= 70
                      ? "#4CAF50"
                      : pronunciationScore.score >= 50
                      ? "#ff9800"
                      : "#f44336",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {pronunciationScore.score}%
              </div>
            ) : (
              formatTime(recordingTime)
            )}
          </div>
        </div>

        {/* Right send button */}
        <button
          className="mobile-send-btn"
          id="mobileStopBtn"
          title="Stop recording"
          onClick={() => {
            console.log("Stop recording button clicked!");
            onStopRecording();
          }}
          disabled={isProcessing}
          style={{
            opacity: isProcessing ? 0.5 : 1,
            cursor: isProcessing ? "not-allowed" : "pointer",
          }}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      {/* Results Display */}
      {pronunciationScore && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <strong>You said:</strong>
            <div
              style={{
                padding: "8px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                margin: "5px 0",
              }}
            >
              {pronunciationScore.transcriptWords.map((word, index) => (
                <span
                  key={index}
                  style={{
                    color: pronunciationScore.matchedTranscriptIndices[index]
                      ? "green"
                      : "red",
                    marginRight: "4px",
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {pronunciationScore.missingWords.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <strong style={{ color: "#f44336" }}>Missing words:</strong>
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#ffebee",
                  borderRadius: "4px",
                  margin: "5px 0",
                }}
              >
                {pronunciationScore.missingWords.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileRecordingUI;
