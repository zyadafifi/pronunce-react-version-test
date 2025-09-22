import React from "react";

const MobileReplayOverlay = ({ show, onReplayClick }) => {
  return (
    <div className={`mobile-replay-overlay ${show ? "show" : ""}`}>
      <button className="mobile-replay-btn" onClick={onReplayClick}>
        <i className="fas fa-redo"></i> Replay
      </button>
    </div>
  );
};

export default MobileReplayOverlay;


