import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useMobileFeatures } from "../hooks/useMobileFeatures";
import lessonsData from "../data/data.json";
import MobileVideoContainer from "../components/mobile/MobileVideoContainer";
import MobileProgressBar from "../components/mobile/MobileProgressBar";
import MobileBackButton from "../components/mobile/MobileBackButton";
import MobileSubtitleContainer from "../components/mobile/MobileSubtitleContainer";
import MobileReplayOverlay from "../components/mobile/MobileReplayOverlay";
import MobilePracticeOverlay from "../components/mobile/MobilePracticeOverlay";
import MobileCompletionCard from "../components/mobile/MobileCompletionCard";
import MobileResultsDialog from "../components/mobile/MobileResultsDialog";
import MobileAlertContainer from "../components/mobile/MobileAlertContainer";
import "./MobilePage.css";

const MobilePage = () => {
  const { lessonNumber, topicId, conversationId } = useParams();
  const navigate = useNavigate();
  const { setCurrentLesson, setCurrentTopic, setCurrentConversation } =
    useProgress();

  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPracticeOverlay, setShowPracticeOverlay] = useState(false);
  const [showReplayOverlay, setShowReplayOverlay] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [pendingVideoPlay, setPendingVideoPlay] = useState(false);

  // Add ref for managing user interaction
  const userInteractionRef = useRef(false);

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
    stopRecordingAndGetBlob,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  } = useNewSpeechRecognition();

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

  const {
    isMobile,
    viewportHeight,
    setupMobileAccessibility,
    enableVideoAudio,
    mobileSpeakSentence,
    playMobileRecordedAudioSlow,
    showMobileAlert,
    hideMobileAlert,
  } = useMobileFeatures();

  // Enhanced video play function with user interaction check
  const safeVideoPlay = async () => {
    if (!videoRef.current) return false;

    try {
      await videoRef.current.play();
      return true;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('Video play blocked - user interaction required');
        setShowIOSAudioOverlay(true);
        setPendingVideoPlay(true);
        return false;
      } else {
        console.error('Video play error:', error);
        return false;
      }
    }
  };

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
        
        // Only try to auto-play if user has interacted
        if (hasUserInteracted || userInteractionRef.current) {
          setTimeout(() => {
            safeVideoPlay();
          }, 100);
        } else {
          // Show interaction overlay for first video
          setShowIOSAudioOverlay(true);
        }
      }
    }
  }, [conversation, currentSentenceIndex, setVideoSource, hasUserInteracted]);

  // Show completion card only when conversation is actually completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionCard(true);
    } else {
      setShowCompletionCard(false);
    }
  }, [isConversationCompleted, currentSentenceIndex, conversation]);

  // Detect if we're on mobile and set initial overlay state
  useEffect(() => {
    if (isMobile) {
      // On mobile, always show the overlay initially
      setShowIOSAudioOverlay(true);
      setHasUserInteracted(false);
    } else {
      // On desktop, user interaction might not be required
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }
  }, [isMobile]);

  const handleBackClick = () => {
    navigate(`/topics/${lessonNumber}`);
  };

  const handleVideoEnd = () => {
    setShowReplayOverlay(true);
    // Show practice overlay after a short delay
    setTimeout(() => {
      setShowPracticeOverlay(true);
    }, 1500);
  };

  const handleReplayClick = async () => {
    setShowReplayOverlay(false);
    // Ensure user has interacted before replaying
    if (hasUserInteracted || userInteractionRef.current) {
      replay();
    } else {
      setShowIOSAudioOverlay(true);
    }
  };

  const handlePracticeClose = () => {
    setShowPracticeOverlay(false);
  };

  const handleListenClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english);
      } else {
        speakText(currentSentence.english);
      }
    }
  };

  const handleListenSlowClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english, true);
      } else {
        speakText(currentSentence.english, 0.7, 1);
      }
    }
  };

  const handleMicClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStopRecording = async () => {
    // Wait for recording to stop and get the audio blob
    const audioBlob = await stopRecordingAndGetBlob();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];

      // Don't show dialog during processing, only after results are ready
      setShowResultsDialog(false);
      setIsProcessingLocal(true);
      setRecognizedText("");
      setMissingWords([]);

      try {
        const result = await calculatePronunciationScore(
          audioBlob,
          currentSentence.english
        );

        setRecognizedText(result.recognizedText);
        setMissingWords(result.missingWords);
        setIsProcessingLocal(false);
        // Show dialog only after results are ready
        setShowResultsDialog(true);
      } catch (error) {
        console.error("Error calculating pronunciation score:", error);
        setRecognizedText("Error processing audio");
        setMissingWords([]);
        setIsProcessingLocal(false);
        // Show dialog even for errors
        setShowResultsDialog(true);
      }
    } else {
      console.error("No conversation or sentence data available");
      setShowResultsDialog(true);
      setIsProcessingLocal(true);
      setRecognizedText("Error: No sentence data available");
      setMissingWords([]);
      setIsProcessingLocal(false);
    }
  };

  const handleRetry = () => {
    setShowResultsDialog(false);
    setIsProcessingLocal(false);
    clearRecording();
    retrySentence();
  };

  const handleContinue = async () => {
    setShowResultsDialog(false);
    setIsProcessingLocal(false);
    clearRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Hide practice overlay and replay overlay
        setShowPracticeOverlay(false);
        setShowReplayOverlay(false);

        // Auto-play next video (only if user has interacted)
        if (hasUserInteracted || userInteractionRef.current) {
          setTimeout(async () => {
            if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
              setVideoSource(conversation.sentences[nextSentenceIndex].videoSrc);
              // Wait a bit for video source to load, then play
              setTimeout(() => {
                safeVideoPlay();
              }, 200);
            }
          }, 500);
        }
      }
    }
  };

  const handleBackToLessons = () => {
    // Save progress before navigating back
    if (lesson && topic && conversation) {
      // Progress is already saved through the ProgressContext
      console.log(
        `Lesson ${lesson.lessonNumber} completed with score: ${overallScore}%`
      );
    }
    navigate(`/topics/${lessonNumber}`);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const handleIOSAudioClick = async () => {
    // Mark that user has interacted
    setHasUserInteracted(true);
    userInteractionRef.current = true;
    
    // Enable video audio
    enableVideoAudio();
    
    // Hide the overlay
    setShowIOSAudioOverlay(false);
    
    // Unmute and try to play video
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      
      // If there was a pending video play, try now
      if (pendingVideoPlay) {
        setPendingVideoPlay(false);
        await safeVideoPlay();
      }
    }
  };

  const handleDeleteRecording = () => {
    clearRecording();
    setShowPracticeOverlay(false);
  };

  const handleVideoClick = async () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
      
      if (isMobile) {
        enableVideoAudio();
        setShowIOSAudioOverlay(false);
        
        // Unmute video on user interaction
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
        }
      }
    }
    
    // Try to play/pause video
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await safeVideoPlay();
      } else {
        pause();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <div className="spinner"></div>
          <span>Loading practice session...</span>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <span>Lesson, topic, or conversation not found</span>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <>
      <div className="mobile-video-container">
        {/* Mobile Progress Bar */}
        <MobileProgressBar
          totalSentences={conversation.sentences.length}
          currentSentenceIndex={currentSentenceIndex}
          completedSentences={completedSentences}
        />

        {/* Back Button */}
        <MobileBackButton onBackClick={handleBackClick} />

        {/* Video Element */}
        <video
          ref={videoRef}
          className="mobile-lesson-video"
          playsInline
          preload="auto"
          muted={!hasUserInteracted}
          webkit-playsinline="true"
          onClick={handleVideoClick}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleVideoEnd}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        >
          <source src={currentSentence?.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* iOS Audio Enable Overlay */}
        {showIOSAudioOverlay && (
          <div className="ios-audio-overlay" onClick={handleIOSAudioClick}>
            <div className="ios-audio-content">
              <i className="fas fa-volume-up"></i>
              <p>Tap to enable audio and start</p>
            </div>
          </div>
        )}

        {/* Subtitle Container */}
        <MobileSubtitleContainer
          englishText={currentSentence?.english}
          arabicText={currentSentence?.arabic}
        />

        {/* Replay Overlay */}
        <MobileReplayOverlay
          show={showReplayOverlay}
          onReplayClick={handleReplayClick}
        />

        {/* Practice Overlay */}
        <MobilePracticeOverlay
          show={showPracticeOverlay}
          sentence={currentSentence}
          isRecording={isRecording}
          recordingTime={recordingTime}
          speechDetected={speechDetected}
          isProcessing={isProcessingLocal}
          pronunciationScore={
            lastScore
              ? {
                  score: lastScore,
                  transcriptWords: recognizedText.split(" "),
                  matchedTranscriptIndices: [],
                  missingWords: missingWords,
                }
              : null
          }
          transcription={recognizedText}
          onClose={handlePracticeClose}
          onListenClick={handleListenClick}
          onListenSlowClick={handleListenSlowClick}
          onMicClick={handleMicClick}
          onStopRecording={handleStopRecording}
          onPlayRecording={playRecordedAudio}
          onDeleteRecording={handleDeleteRecording}
        />

        {/* Completion Card */}
        <MobileCompletionCard
          show={showCompletionCard}
          overallScore={overallScore}
          onBackToLessons={handleBackToLessons}
        />

        {/* Alert Container */}
        <MobileAlertContainer
          show={showAlert}
          message={alertMessage}
          onClose={hideAlert}
        />
      </div>

      {/* Mobile Results Dialog - Outside mobile-video-container */}
      {showResultsDialog && (
        <MobileResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          missingWords={missingWords}
          isProcessing={isProcessingLocal}
          targetText={conversation?.sentences?.[currentSentenceIndex]?.english}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
        />
      )}
    </>
  );
};

export default MobilePage;