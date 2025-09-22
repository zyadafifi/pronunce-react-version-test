import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import lessonsData from "../data/data.json";
import DesktopHeader from "../components/desktop/DesktopHeader";
import DesktopProgressSection from "../components/desktop/DesktopProgressSection";
import DesktopVideoSection from "../components/desktop/DesktopVideoSection";
import DesktopPracticeSection from "../components/desktop/DesktopPracticeSection";
import DesktopResultsDialog from "../components/desktop/DesktopResultsDialog";
import DesktopCompletionModal from "../components/desktop/DesktopCompletionModal";
import "./DesktopPage.css";

const DesktopPage = () => {
  const { lessonNumber, topicId, conversationId } = useParams();
  const navigate = useNavigate();
  const { setCurrentLesson, setCurrentTopic, setCurrentConversation } =
    useProgress();

  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Hooks
  const {
    currentSentenceIndex,
    sentenceScores,
    completedSentences,
    overallScore,
    progressPercentage,
    isConversationCompleted,
    isCurrentSentenceCompleted,
    completeSentence,
    retrySentence,
    resetConversation,
    setCurrentSentenceIndex,
  } = useConversationProgress(
    conversationId ? parseInt(conversationId) : 0,
    conversation?.sentences?.length || 0
  );

  const {
    isRecording,
    isSpeaking,
    recordedAudio,
    recordingTime,
    speechDetected,
    startRecording,
    stopRecording,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  } = useSpeechRecognition();

  const {
    isProcessing,
    lastScore,
    calculatePronunciationScore,
    getScoreColor,
    getScoreMessage,
  } = usePronunciationScoring();

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    play,
    pause,
    replay,
    setVideoSource,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  } = useVideoPlayer();

  // Load conversation data
  useEffect(() => {
    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );
    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);

      const currentTopic = currentLesson.topics.find(
        (t) => t.id === parseInt(topicId)
      );
      if (currentTopic) {
        setTopic(currentTopic);
        setCurrentTopic(currentTopic.id);

        const currentConversation = currentTopic.conversations.find(
          (c) => c.id === parseInt(conversationId)
        );
        if (currentConversation) {
          setConversation(currentConversation);
          setCurrentConversation(currentConversation.id);
        }
      }
    }
    setIsLoading(false);
  }, [
    lessonNumber,
    topicId,
    conversationId,
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
  ]);

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (currentSentence.videoSrc) {
        setVideoSource(currentSentence.videoSrc);
      }
    }
  }, [conversation, currentSentenceIndex, setVideoSource]);

  // Show completion modal when conversation is completed
  useEffect(() => {
    if (isConversationCompleted) {
      setShowCompletionModal(true);
    }
  }, [isConversationCompleted]);

  const handleBackClick = () => {
    navigate(`/topics/${lessonNumber}`);
  };

  const handlePlayVideo = () => {
    play();
  };

  const handleReplayVideo = () => {
    replay();
  };

  const handleListenClick = () => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      speakText(currentSentence.english);
    }
  };

  const handleListenSlowClick = () => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      speakText(currentSentence.english, 0.7, 1);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStopRecording = async () => {
    stopRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      const result = await calculatePronunciationScore(
        recordedAudio,
        currentSentence.english
      );

      // Show results dialog
      setShowResultsDialog(true);
    }
  };

  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    retrySentence();
  };

  const handleContinue = () => {
    setShowResultsDialog(false);
    clearRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      completeSentence(currentSentenceIndex, lastScore);
    }
  };

  const handleCloseResults = () => {
    setShowResultsDialog(false);
  };

  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
    navigate(`/topics/${lessonNumber}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="desktop-container">
        <div className="loading">Loading practice session...</div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="desktop-container">
        <div className="error">Lesson, topic, or conversation not found</div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <div className="desktop-container">
      {/* Main Content Container */}
      <div className="main-container">
        <div className="content-wrapper">
          {/* Learning Progress Section */}
          <DesktopProgressSection
            currentSentenceIndex={currentSentenceIndex + 1}
            totalSentences={conversation.sentences.length}
            progressPercentage={progressPercentage}
          />

          {/* Watch & Learn Section */}
          <DesktopVideoSection
            videoRef={videoRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isLoading={videoLoading}
            hasError={videoError}
            onPlay={handlePlayVideo}
            onReplay={handleReplayVideo}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlayEvent={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            currentSentence={currentSentence}
          />

          {/* Practice Section */}
          <DesktopPracticeSection
            currentSentence={currentSentence}
            isRecording={isRecording}
            recordingTime={recordingTime}
            speechDetected={speechDetected}
            onListenClick={handleListenClick}
            onListenSlowClick={handleListenSlowClick}
            onMicClick={handleMicClick}
            onStopRecording={handleStopRecording}
            onPlayRecording={playRecordedAudio}
          />
        </div>
      </div>

      {/* Results Dialog */}
      <DesktopResultsDialog
        show={showResultsDialog}
        score={lastScore}
        recognizedText="Recognized text will appear here"
        missingWords={[]}
        isProcessing={isProcessing}
        onRetry={handleRetry}
        onContinue={handleContinue}
        onClose={handleCloseResults}
        onListenClick={handleListenClick}
        onPlayRecording={playRecordedAudio}
      />

      {/* Completion Modal */}
      <DesktopCompletionModal
        show={showCompletionModal}
        overallScore={overallScore}
        onClose={handleCloseCompletion}
      />
    </div>
  );
};

export default DesktopPage;
