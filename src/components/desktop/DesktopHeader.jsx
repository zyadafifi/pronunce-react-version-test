import React from "react";

const DesktopHeader = ({ onBackClick }) => {
  return (
    <div className="header-container">
      <div className="header-content">
        <div className="app-title">
          <div className="app-icon">
            <i className="fas fa-microphone"></i>
          </div>
          <h1>Pronunciation Master</h1>
        </div>
        <div className="lesson-progress-btn">
          <button className="btn" onClick={onBackClick}>
            <i className="fas fa-chart-line"></i>
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;


