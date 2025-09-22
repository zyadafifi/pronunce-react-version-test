import React from "react";

const DesktopResultsDialog = ({
  show,
  score,
  recognizedText,
  missingWords,
  isProcessing,
  onRetry,
  onContinue,
  onClose,
  onListenClick,
  onPlayRecording,
}) => {
  return (
    <div className={`dialog-container ${show ? "active" : ""}`}>
      <div className="dialog-backdrop"></div>
      <div className="dialog-content">
        {/* Close Button */}
        <button className="close-btn" title="Close dialog" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* Dialog Header */}
        <div className="dialog-header">
          <div className="dialog-icon">
            <i className="fas fa-microphone"></i>
          </div>
          <h4>Your Pronunciation Review</h4>

          {/* Enhanced Pronunciation Score Circle */}
          <div className="score-circle-container">
            <div className="score-circle" id="scoreCircle">
              <div className="score-circle-inner">
                <span className="score-percentage" id="scorePercentage">
                  {score}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="results-content">
          <div id="recognizedText" className="recognized-text">
            <p>{recognizedText}</p>
          </div>
          {missingWords.length > 0 && (
            <div className="missing-words">
              Missing words: {missingWords.join(", ")}
            </div>
          )}
        </div>

        {/* Dialog Controls */}
        <div className="dialog-controls">
          {/* Listen Button in Dialog */}
          <button
            className="control-btn listen-btn"
            id="listen2Button"
            title="Listen to example"
            onClick={onListenClick}
          >
            <i className="fas fa-volume-up"></i>
          </button>

          {/* Action Buttons */}
          <div className="dialog-buttons">
            <button
              id="retryButton"
              className="btn btn-secondary"
              onClick={onRetry}
            >
              <i className="fas fa-redo"></i> Retry
            </button>
            <button
              id="nextButton"
              className="btn btn-primary"
              onClick={onContinue}
            >
              Continue
            </button>
          </div>

          {/* Play Recording Button in Dialog */}
          <button
            className="control-btn play-btn"
            id="bookmark-icon2"
            title="Play recorded audio"
            onClick={onPlayRecording}
          >
            <i className="fas fa-headphones"></i>
          </button>
        </div>

        {/* Hidden Pronunciation Score (for compatibility) */}
        <div
          id="pronunciationScore"
          className="pronunciation-score"
          style={{ display: "none" }}
        >
          {score}%
        </div>
      </div>
    </div>
  );
};

export default DesktopResultsDialog;


