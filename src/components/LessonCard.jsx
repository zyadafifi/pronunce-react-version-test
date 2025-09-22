import "./LessonCard.css";

const LessonCard = ({ lesson, index, onClick, isLast }) => {
  const isLocked = lesson.locked;
  const isCompleted = lesson.completed;
  const isCurrent = !isLocked && !isCompleted && index === 2; // Lesson 3 is current

  return (
    <div
      className={`lesson-card ${isLocked ? "locked" : ""} ${
        isCompleted ? "completed" : ""
      } ${isCurrent ? "current" : ""}`}
      onClick={onClick}
    >
      <div className="lesson-avatar">
        <img src={lesson.avatar} alt={lesson.title} />
        {isCompleted && (
          <div className="completion-badge">
            <i className="fas fa-check"></i>
          </div>
        )}
        {isLocked && (
          <div className="lock-badge">
            <i className="fas fa-lock"></i>
          </div>
        )}
      </div>

      <div className="lesson-content">
        <div className="lesson-info">
          <h3 className="lesson-title">Lesson {lesson.id}</h3>
          <p className="lesson-subtitle">{lesson.title}</p>
        </div>

        <div className="lesson-arrow">
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
