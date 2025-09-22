import React, { useState, useEffect, useRef, useCallback } from "react";

const MobilePracticeOverlay = ({
  show = false,
  sentence = {
    english: "Can I see the menu?",
    phonetic: "kæn aɪ siː ðə mɛnjuː",
  },
  onClose = () => {},
  onComplete = () => {},
}) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 26 }, () => 6)
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [recognizedText, setRecognizedText] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const waveformAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // AssemblyAI API Key (replace with your actual key)
  const ASSEMBLYAI_API_KEY = "bdb00961a07c4184889a80206c52b6f2";

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setWaveformBars(Array.from({ length: 26 }, () => 6));
    setRecordingTime(0);
  }, []);

  // Speech synthesis for listening
  const handleListen = useCallback(
    (slow = false) => {
      if (isRecording) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence.english);
      utterance.lang = "en-US";
      utterance.rate = slow ? 0.6 : 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [sentence.english, isRecording, isSpeaking]
  );

  // Play recorded audio
  const handlePlayRecorded = useCallback(() => {
    if (!recordedBlob || isRecording) return;

    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audio.playbackRate = 0.7; // Slow playback
    audio.play().catch(console.error);
  }, [recordedBlob, isRecording]);

  // Waveform animation
  const animateWaveform = useCallback(() => {
    if (!isRecording || !analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    setWaveformBars((prev) =>
      prev.map((_, index) => {
        const dataIndex = Math.floor((index * dataArray.length) / prev.length);
        const amplitude = dataArray[dataIndex] / 255;
        const baselineActivity = 0.1 + Math.random() * 0.1;
        const finalAmplitude = Math.max(amplitude, baselineActivity);
        return 6 + finalAmplitude * 20;
      })
    );

    waveformAnimationRef.current = requestAnimationFrame(animateWaveform);
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      cleanup();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context and analyser
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecondary: 128000,
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the recording
        await processRecording(blob);
      };

      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      mediaRecorderRef.current.start(100);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start waveform animation
      animateWaveform();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error("Recording failed:", error);
      alert("Could not access microphone. Please check permissions.");
      cleanup();
      setIsRecording(false);
    }
  }, [animateWaveform, cleanup]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    setRecordedBlob(null);
    cleanup();
  }, [cleanup]);

  // Process recording with AssemblyAI
  const processRecording = useCallback(
    async (blob) => {
      if (!blob || blob.size < 1000) {
        alert("Recording too short. Please try again.");
        return;
      }

      setIsProcessing(true);

      try {
        // Upload to AssemblyAI
        const uploadResponse = await fetch(
          "https://api.assemblyai.com/v2/upload",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/octet-stream",
            },
            body: blob,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const uploadData = await uploadResponse.json();

        // Request transcription
        const transcriptionResponse = await fetch(
          "https://api.assemblyai.com/v2/transcript",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              audio_url: uploadData.upload_url,
              language_code: "en",
            }),
          }
        );

        if (!transcriptionResponse.ok) {
          throw new Error("Transcription request failed");
        }

        const transcriptionData = await transcriptionResponse.json();

        // Poll for completion
        let result;
        while (true) {
          const statusResponse = await fetch(
            `https://api.assemblyai.com/v2/transcript/${transcriptionData.id}`,
            {
              headers: { authorization: ASSEMBLYAI_API_KEY },
            }
          );

          result = await statusResponse.json();

          if (result.status === "completed") {
            break;
          } else if (result.status === "error") {
            throw new Error("Transcription failed");
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Calculate score and show results dialog
        const score = calculatePronunciationScore(
          result.text,
          sentence.english
        );

        setIsProcessing(false);
        setLastScore(score);
        setRecognizedText(result.text);
        setShowResultsDialog(true);
      } catch (error) {
        console.error("Processing error:", error);
        setIsProcessing(false);
        setLastScore(0);
        setRecognizedText("Error processing audio");
        setShowResultsDialog(true);
      }
    },
    [sentence.english]
  );

  // Calculate pronunciation score
  const calculatePronunciationScore = useCallback((recognized, expected) => {
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

    const recognizedWords = normalizeText(recognized).split(/\s+/);
    const expectedWords = normalizeText(expected).split(/\s+/);

    if (recognizedWords.length === 0 || expectedWords.length === 0) return 0;

    let matches = 0;
    expectedWords.forEach((expectedWord) => {
      if (
        recognizedWords.some((recognizedWord) => {
          const similarity = calculateSimilarity(recognizedWord, expectedWord);
          return similarity > 0.7;
        })
      ) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  }, []);

  // Calculate word similarity
  const calculateSimilarity = useCallback((word1, word2) => {
    if (word1 === word2) return 1;

    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;

    if (longer.length === 0) return 1;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }, []);

  // Levenshtein distance calculation
  const levenshteinDistance = useCallback((str1, str2) => {
    const matrix = Array(str2.length + 1)
      .fill()
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }, []);

  // Format recording time
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Reset state when show changes
  useEffect(() => {
    if (!show) {
      cleanup();
      setIsRecording(false);
      setIsProcessing(false);
      setRecordedBlob(null);
      setShowResultsDialog(false);
      setLastScore(0);
      setRecognizedText("");
      setAnimatedScore(0);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [show, cleanup]);

  // Animate score circle when dialog opens
  useEffect(() => {
    if (showResultsDialog && lastScore > 0) {
      const duration = 1000; // 1 second animation
      const steps = 30;
      const increment = lastScore / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const currentScore = Math.min(increment * currentStep, lastScore);
        setAnimatedScore(Math.round(currentScore));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [showResultsDialog, lastScore]);

  // Results dialog handlers
  const handleRetry = useCallback(() => {
    setShowResultsDialog(false);
    setLastScore(0);
    setRecognizedText("");
    setAnimatedScore(0);
    setRecordedBlob(null);
  }, []);

  const handleContinue = useCallback(() => {
    setShowResultsDialog(false);
    setLastScore(0);
    setRecognizedText("");
    setAnimatedScore(0);
    setRecordedBlob(null);
    onComplete({
      score: lastScore,
      recognizedText,
      targetText: sentence.english,
      recordedBlob,
    });
  }, [lastScore, recognizedText, sentence.english, recordedBlob, onComplete]);

  const handleDialogClose = useCallback(() => {
    setShowResultsDialog(false);
  }, []);

  // Play recorded audio from dialog
  const handlePlayRecordedFromDialog = useCallback(() => {
    if (!recordedBlob) return;

    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audio.play().catch(console.error);
  }, [recordedBlob]);

  // Process recognized text for display
  const processRecognizedTextForDisplay = useCallback(() => {
    if (!recognizedText) {
      return "No recording detected";
    }

    // Simple word matching for color coding
    const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]/g, "");
    const targetWords = normalizeText(sentence.english).split(/\s+/);
    const recognizedWords = normalizeText(recognizedText).split(/\s+/);

    return recognizedWords
      .map((word, index) => {
        const isCorrect = targetWords.some((targetWord) => {
          if (targetWord === word) return true;
          // Simple similarity check
          const similarity = calculateSimilarity(word, targetWord);
          return similarity > 0.7;
        });

        return `<span style="color: ${isCorrect ? "#28a745" : "#dc3545"}">${
          recognizedText.split(/\s+/)[index] || word
        }</span>`;
      })
      .join(" ");
  }, [recognizedText, sentence.english, calculateSimilarity]);

  // Calculate score circle stroke
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <>
      <div className={`mobile-practice-overlay ${show ? "show" : ""}`}>
        <div className="practice-card">
          {/* Close Button */}
          <button className="practice-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>

          {/* Header */}
          <div className="practice-header">
            <h3>Your turn!</h3>
            <p>
              Press the <i className="fas fa-microphone"></i> and record your
              voice.
            </p>
          </div>

          {/* Sentence - Always Visible */}
          <div className="practice-sentence">
            <div className="sentence-text">{sentence.english}</div>
            <div className="sentence-phonetic">{sentence.phonetic}</div>
          </div>

          {/* Normal State - Practice Controls */}
          {!isRecording && !isProcessing && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn"
                onClick={() => handleListen(false)}
              >
                <i className="fas fa-volume-up"></i>
                <span>Listen</span>
              </button>

              <button className="mic-btn" onClick={startRecording}>
                <i className="fas fa-microphone"></i>
              </button>

              <button
                className="control-btn listen-slow-btn"
                onClick={handlePlayRecorded}
              >
                <i className="fas fa-headphones"></i>
                <span>Listen</span>
              </button>
            </div>
          )}

          {/* Recording State - Waveform replaces controls */}
          {isRecording && !isProcessing && (
            <div className="mobile-waveform-container">
              <button
                className="mobile-pause-btn"
                onClick={cancelRecording}
                title="Delete recording"
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>

              <div className="mobile-waveform-area">
                <div className="mobile-waveform-bars">
                  {waveformBars.map((height, index) => (
                    <div
                      key={index}
                      className="mobile-waveform-bar"
                      style={{
                        height: `${height}px`,
                        transition: "height 0.1s ease",
                      }}
                    ></div>
                  ))}
                </div>

                <div className="mobile-recording-timer">
                  {formatTime(recordingTime)}
                </div>
              </div>

              <button
                className="mobile-send-btn"
                onClick={stopRecording}
                title="Stop recording"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          )}

          {/* Processing State - Only spinner in place of mic */}
          {isProcessing && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn"
                onClick={() => handleListen(false)}
              >
                <i className="fas fa-volume-up"></i>
                <span>Listen</span>
              </button>

              <button className="mic-btn processing" disabled>
                <div className="processing-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              <button
                className="control-btn listen-slow-btn"
                onClick={handlePlayRecorded}
              >
                <i className="fas fa-headphones"></i>
                <span>Listen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Results Dialog */}
      {showResultsDialog && (
        <div className="mobile-dialog-container active">
          <div
            className="mobile-dialog-backdrop"
            onClick={handleDialogClose}
          ></div>
          <div className="mobile-dialog-content">
            {/* Close Button */}
            <button className="mobile-close-btn" onClick={handleDialogClose}>
              <i className="fas fa-times"></i>
            </button>

            {/* Dialog Header */}
            <div className="mobile-dialog-header">
              <div className="mobile-dialog-icon">
                <i className="fas fa-microphone"></i>
              </div>
              <h4>Your Pronunciation Review</h4>

              {/* Pronunciation Score Circle */}
              <div className="mobile-score-circle-container">
                <svg className="mobile-score-circle" width="120" height="120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#e9ecef"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#4b9b94"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                    style={{
                      transition: "stroke-dashoffset 1s ease-in-out",
                    }}
                  />
                </svg>
                <div className="mobile-score-percentage">{animatedScore}%</div>
              </div>
            </div>

            {/* Results Content */}
            <div className="mobile-results-content">
              <div className="mobile-sentence-comparison">
                <div className="mobile-original-sentence">
                  <strong>Original:</strong>
                  <p>{sentence.english}</p>
                </div>
                <div className="mobile-user-sentence">
                  <strong>You said:</strong>
                  <p
                    className={
                      lastScore >= 80 ? "correct-text" : "incorrect-text"
                    }
                    dangerouslySetInnerHTML={{
                      __html: processRecognizedTextForDisplay(),
                    }}
                  ></p>
                </div>
              </div>
            </div>

            {/* Dialog Controls */}
            <div className="mobile-dialog-controls">
              {/* Listen Button */}
              <button
                className="mobile-control-btn mobile-listen-btn"
                title="Listen to example"
                onClick={() => handleListen(false)}
              >
                <i className="fas fa-volume-up"></i>
              </button>

              {/* Action Buttons */}
              <div className="mobile-dialog-buttons">
                <button
                  className="mobile-btn mobile-btn-secondary"
                  onClick={handleRetry}
                >
                  <i className="fas fa-redo"></i> Retry
                </button>
                <button
                  className={`mobile-btn mobile-btn-primary ${
                    lastScore >= 50 ? "success" : "error"
                  }`}
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>

              {/* Play Recording Button */}
              <button
                className="mobile-control-btn mobile-play-btn"
                title="Play recorded audio"
                onClick={handlePlayRecordedFromDialog}
                disabled={!recordedBlob}
                style={{
                  opacity: recordedBlob ? 1 : 0.5,
                  cursor: recordedBlob ? "pointer" : "not-allowed",
                }}
              >
                <i className="fas fa-headphones"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobilePracticeOverlay;
