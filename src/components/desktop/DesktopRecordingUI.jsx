import React from "react";

const DesktopRecordingUI = ({
  show,
  recordingTime,
  speechDetected,
  onStopRecording,
  isProcessing = false,
  pronunciationScore = null,
  transcription = null,
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!show) return null;

  return (
    <div className="recording-ui-container">
      <div className="recording-controls">
        <button
          className="recording-action-btn delete-btn"
          id="deleteRecButton"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="recording-visual">
          <div className="recording-waveform">
            {/* Waveform bars will be generated here */}
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="waveform-bar"></div>
            ))}
          </div>
          <div className="recording-timer" id="recordingTimer">
            {isProcessing ? (
              <div style={{ color: "#2196F3", fontSize: "14px" }}>
                🔄 Processing...
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

        <button
          className="recording-action-btn send-btn"
          id="stopRecButton"
          onClick={onStopRecording}
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
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <strong>You said:</strong>
            <div
              style={{
                padding: "10px",
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
            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#f44336" }}>Missing words:</strong>
              <div
                style={{
                  padding: "10px",
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

export default DesktopRecordingUI;
