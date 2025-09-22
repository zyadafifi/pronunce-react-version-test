import { useState } from "react";
import "./TopicCard.css";

const TopicCard = ({ topic, index, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = topic.completed;
  const isAvailable = index === 0 || true; // For now, make all topics available

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleConversationClick = (conversation) => {
    // This will be handled by the parent component
    onClick(conversation);
  };

  const calculateTopicProgress = () => {
    if (!topic.conversations.length) return 0;

    const completedConversations = topic.conversations.filter(
      (conv) => conv.completed
    ).length;
    return Math.round(
      (completedConversations / topic.conversations.length) * 100
    );
  };

  return (
    <div
      className={`topic-card ${isCompleted ? "completed" : ""} ${
        isAvailable ? "available" : "locked"
      }`}
      onClick={isAvailable ? onClick : undefined}
    >
      <div className="topic-header">
        <div className="topic-icon">
          <i className={topic.icon}></i>
        </div>

        <div className="topic-info">
          <h3 className="topic-title">{topic.title}</h3>
          <p className="topic-description">{topic.description}</p>
        </div>

        <div className="topic-actions">
          {isAvailable ? (
            <i className="fas fa-chevron-right"></i>
          ) : (
            <div className="lock-icon">
              <i className="fas fa-lock"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
