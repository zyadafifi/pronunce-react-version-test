import { useState, useRef, useEffect } from "react";
import SpeechRecognition from "../hooks/useSpeechRecognition";
import "./PracticeInterface.css";

const PracticeInterface = ({
  sentence,
  sentenceIndex,
  onComplete,
  onRetry,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = SpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setRecognizedText(transcript);
      calculateScore(transcript);
    }
  }, [transcript]);

  const calculateScore = (recognized) => {
    if (!sentence || !recognized) return 0;

    const original = sentence.english.toLowerCase().trim();
    const recognizedLower = recognized.toLowerCase().trim();

    // Simple word matching algorithm
    const originalWords = original.split(/\s+/);
    const recognizedWords = recognizedLower.split(/\s+/);

    let matches = 0;
    originalWords.forEach((word) => {
      if (recognizedWords.includes(word)) {
        matches++;
      }
    });

    const percentage = Math.round((matches / originalWords.length) * 100);
    setScore(percentage);
    return percentage;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startListening();
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Microphone access denied. Please allow microphone access to use this feature."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopListening();
    }
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const playOriginal = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(sentence.english);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    const finalScore = calculateScore(recognizedText);
    setShowResults(true);
    setTimeout(() => {
      onComplete(sentenceIndex, finalScore);
    }, 2000);
  };

  const handleRetry = () => {
    setRecordedAudio(null);
    setRecognizedText("");
    setScore(0);
    setShowResults(false);
    resetTranscript();
    onRetry();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent!";
    if (score >= 60) return "Good job!";
    if (score >= 40) return "Keep practicing!";
    return "Try again!";
  };

  if (!sentence) {
    return <div className="practice-interface">No sentence available</div>;
  }

  return (
    <div className="practice-interface">
      <div className="sentence-display">
        <div className="panel-header">
          <h3>Your turn!</h3>
          <button className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p>
          Press the <i className="fas fa-microphone"></i> and record your voice.
        </p>

        <div className="sentence-container">
          <div className="sentence-text">{sentence.english}</div>
          <div className="sentence-phonetic">
            {sentence.english.toLowerCase().replace(/[^a-z\s]/g, "")}
          </div>
        </div>

        <div className="translation-container">
          <div className="translation-text">{sentence.arabic}</div>
        </div>
      </div>

      <div className="control-buttons">
        <button
          className="control-btn listen-btn"
          onClick={playOriginal}
          title="Listen to example"
        >
          <i className="fas fa-volume-up"></i>
          <span>Listen</span>
        </button>

        <button
          className={`mic-button ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <i className="fas fa-microphone"></i>
        </button>

        <button
          className="control-btn play-btn"
          onClick={playRecording}
          disabled={!recordedAudio}
          title="Play recorded audio"
        >
          <i className="fas fa-headphones"></i>
          <span>Listen</span>
        </button>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <i className="fas fa-circle recording-dot"></i>
          <span>Recording...</span>
        </div>
      )}

      {recognizedText && (
        <div className="recognized-text">
          <h4>You said:</h4>
          <p>"{recognizedText}"</p>
          <div className="score-display">
            <span className="score-label">Score:</span>
            <span
              className="score-value"
              style={{ color: getScoreColor(score) }}
            >
              {score}%
            </span>
          </div>
        </div>
      )}

      {recognizedText && !showResults && (
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleRetry}>
            <i className="fas fa-redo"></i>
            Retry
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <i className="fas fa-check"></i>
            Continue
          </button>
        </div>
      )}

      {showResults && (
        <div className="results-modal">
          <div className="results-content">
            <div className="completion-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h3>Great job!</h3>
            <p>{getScoreMessage(score)}</p>
            <div className="final-score">
              <span className="score-label">Your score:</span>
              <span
                className="score-value"
                style={{ color: getScoreColor(score) }}
              >
                {score}%
              </span>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default PracticeInterface;
