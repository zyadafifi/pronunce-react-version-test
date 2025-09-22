import "./ProgressBar.css";

const ProgressBar = ({ current, total, progress }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-section">
      <div className="progress-header">
        <div className="progress-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <span className="progress-label">Learning Progress</span>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          >
            <span className="progress-percentage">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="sentence-counter">
        <span className="current-sentence">{current}</span>
        <span className="counter-separator">of</span>
        <span className="total-sentences">{total}</span>
        <span className="counter-label">sentences</span>
      </div>
    </div>
  );
};

export default ProgressBar;
