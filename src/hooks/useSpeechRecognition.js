import { useState, useRef, useCallback } from "react";

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechDetected, setSpeechDetected] = useState(false);
  const speechDetectedRef = useRef(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const noSpeechTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveformAnimationRef = useRef(null);
  const stopRecordingResolveRef = useRef(null);

  const NO_SPEECH_TIMEOUT_MS = 10000; // Increased to 10 seconds

  const startRecording = useCallback(async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      console.log("Microphone access granted");

      // Try to find a supported MIME type
      const getSupportedMimeType = () => {
        const types = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/wav",
        ];

        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            console.log("Using MIME type:", type);
            return type;
          }
        }
        console.log("No supported MIME type found, using default");
        return "";
      };

      const selectedMimeType = getSupportedMimeType();
      console.log("Selected MIME type for MediaRecorder:", selectedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      console.log(
        "MediaRecorder created with mimeType:",
        mediaRecorder.mimeType
      );

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log(
          "MediaRecorder data available, size:",
          event.data.size,
          "state:",
          mediaRecorder.state
        );
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(
            "Audio chunk added, total chunks:",
            audioChunksRef.current.length
          );
        } else {
          console.log("No audio data available");
        }
        console.log("MediaRecorder data collection interval: 100ms");
        console.log("MediaRecorder mimeType:", mediaRecorder.mimeType);
        console.log(
          "MediaRecorder audio tracks:",
          stream.getAudioTracks().length
        );
        console.log(
          "MediaRecorder audio track settings:",
          stream.getAudioTracks()[0]?.getSettings()
        );
        console.log(
          "MediaRecorder audio track constraints:",
          stream.getAudioTracks()[0]?.getConstraints()
        );
        console.log(
          "MediaRecorder audio track capabilities:",
          stream.getAudioTracks()[0]?.getCapabilities()
        );
        console.log(
          "MediaRecorder audio track label:",
          stream.getAudioTracks()[0]?.label
        );
        console.log(
          "MediaRecorder audio track enabled:",
          stream.getAudioTracks()[0]?.enabled
        );
        console.log(
          "MediaRecorder audio track muted:",
          stream.getAudioTracks()[0]?.muted
        );
        console.log(
          "MediaRecorder audio track readyState:",
          stream.getAudioTracks()[0]?.readyState
        );
        console.log(
          "MediaRecorder audio track kind:",
          stream.getAudioTracks()[0]?.kind
        );
        console.log(
          "MediaRecorder audio track id:",
          stream.getAudioTracks()[0]?.id
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, state:", mediaRecorder.state);
        console.log("MediaRecorder mimeType:", mediaRecorder.mimeType);

        // Ensure we have a valid MIME type
        let mimeType = mediaRecorder.mimeType;
        if (!mimeType || mimeType === "") {
          mimeType = "audio/webm;codecs=opus";
          console.log("Using fallback MIME type:", mimeType);
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        console.log("Audio blob created, size:", audioBlob.size);
        console.log("Audio blob type:", audioBlob.type);
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        console.log("MediaRecorder recording completed!");
        console.log(
          "Total audio chunks collected:",
          audioChunksRef.current.length
        );
        console.log("MediaRecorder mimeType:", mediaRecorder.mimeType);
        console.log(
          "MediaRecorder audio tracks stopped:",
          stream.getAudioTracks().length
        );
        console.log(
          "MediaRecorder audio track settings:",
          stream.getAudioTracks()[0]?.getSettings()
        );
        console.log(
          "MediaRecorder audio track constraints:",
          stream.getAudioTracks()[0]?.getConstraints()
        );
        console.log(
          "MediaRecorder audio track capabilities:",
          stream.getAudioTracks()[0]?.getCapabilities()
        );
        console.log(
          "MediaRecorder audio track label:",
          stream.getAudioTracks()[0]?.label
        );
        console.log(
          "MediaRecorder audio track enabled:",
          stream.getAudioTracks()[0]?.enabled
        );
        console.log(
          "MediaRecorder audio track muted:",
          stream.getAudioTracks()[0]?.muted
        );
        console.log(
          "MediaRecorder audio track readyState:",
          stream.getAudioTracks()[0]?.readyState
        );
        console.log(
          "MediaRecorder audio track kind:",
          stream.getAudioTracks()[0]?.kind
        );
        console.log(
          "MediaRecorder audio track id:",
          stream.getAudioTracks()[0]?.id
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );

        // Resolve the promise with the audio blob
        if (stopRecordingResolveRef.current) {
          stopRecordingResolveRef.current(audioBlob);
          stopRecordingResolveRef.current = null;
        }
      };

      mediaRecorder.onstart = () => {
        console.log("MediaRecorder started, state:", mediaRecorder.state);
        console.log("MediaRecorder is now recording!");
        console.log("MediaRecorder will collect data every 100ms");
        console.log("MediaRecorder mimeType:", mediaRecorder.mimeType);
        console.log(
          "MediaRecorder audio tracks:",
          stream.getAudioTracks().length
        );
        console.log(
          "MediaRecorder audio track settings:",
          stream.getAudioTracks()[0]?.getSettings()
        );
        console.log(
          "MediaRecorder audio track constraints:",
          stream.getAudioTracks()[0]?.getConstraints()
        );
        console.log(
          "MediaRecorder audio track capabilities:",
          stream.getAudioTracks()[0]?.getCapabilities()
        );
        console.log(
          "MediaRecorder audio track label:",
          stream.getAudioTracks()[0]?.label
        );
        console.log(
          "MediaRecorder audio track enabled:",
          stream.getAudioTracks()[0]?.enabled
        );
        console.log(
          "MediaRecorder audio track muted:",
          stream.getAudioTracks()[0]?.muted
        );
        console.log(
          "MediaRecorder audio track readyState:",
          stream.getAudioTracks()[0]?.readyState
        );
        console.log(
          "MediaRecorder audio track kind:",
          stream.getAudioTracks()[0]?.kind
        );
        console.log(
          "MediaRecorder audio track id:",
          stream.getAudioTracks()[0]?.id
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
      };

      mediaRecorder.onpause = () => {
        console.log("MediaRecorder paused, state:", mediaRecorder.state);
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
      };

      mediaRecorder.onresume = () => {
        console.log("MediaRecorder resumed, state:", mediaRecorder.state);
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.log(
          "MediaRecorder audio track contentHint:",
          stream.getAudioTracks()[0]?.contentHint
        );
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        console.error("MediaRecorder state during error:", mediaRecorder.state);
        console.error("MediaRecorder error details:", event);
        console.error("MediaRecorder mimeType:", mediaRecorder.mimeType);
        console.error(
          "MediaRecorder audio tracks during error:",
          stream.getAudioTracks().length
        );
        console.error(
          "MediaRecorder audio track settings during error:",
          stream.getAudioTracks()[0]?.getSettings()
        );
        console.error(
          "MediaRecorder audio track constraints during error:",
          stream.getAudioTracks()[0]?.getConstraints()
        );
        console.error(
          "MediaRecorder audio track capabilities during error:",
          stream.getAudioTracks()[0]?.getCapabilities()
        );
        console.error(
          "MediaRecorder audio track label during error:",
          stream.getAudioTracks()[0]?.label
        );
        console.error(
          "MediaRecorder audio track enabled during error:",
          stream.getAudioTracks()[0]?.enabled
        );
        console.error(
          "MediaRecorder audio track muted during error:",
          stream.getAudioTracks()[0]?.muted
        );
        console.error(
          "MediaRecorder audio track readyState during error:",
          stream.getAudioTracks()[0]?.readyState
        );
        console.error(
          "MediaRecorder audio track kind during error:",
          stream.getAudioTracks()[0]?.kind
        );
        console.error(
          "MediaRecorder audio track id during error:",
          stream.getAudioTracks()[0]?.id
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        console.error(
          "MediaRecorder audio track contentHint during error:",
          stream.getAudioTracks()[0]?.contentHint
        );
        stopRecording();
      };

      // Setup audio analysis for waveform
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorder.start(100); // Collect data every 100ms
      console.log("MediaRecorder started, state:", mediaRecorder.state);
      setIsRecording(true);
      setRecordingTime(0);
      setSpeechDetected(false);
      speechDetectedRef.current = false;

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1);
      }, 100);

      // Start speech detection timeout
      noSpeechTimeoutRef.current = setTimeout(() => {
        console.log(
          "Speech detection timeout reached, speechDetected:",
          speechDetectedRef.current
        );
        if (!speechDetectedRef.current) {
          console.log("No speech detected, stopping recording...");
          stopRecording();
        }
      }, NO_SPEECH_TIMEOUT_MS);

      // Start waveform animation after a short delay to ensure DOM is ready
      setTimeout(() => {
        startWaveformAnimation();
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Microphone access denied. Please allow microphone access and try again."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("stopRecording called, isRecording:", isRecording);
    if (mediaRecorderRef.current && isRecording) {
      console.log(
        "Stopping media recorder...",
        "State:",
        mediaRecorderRef.current.state
      );

      return new Promise((resolve) => {
        // Store the resolve function to call when recording stops
        stopRecordingResolveRef.current = resolve;
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        if (noSpeechTimeoutRef.current) {
          clearTimeout(noSpeechTimeoutRef.current);
          noSpeechTimeoutRef.current = null;
        }

        stopWaveformAnimation();
        setSpeechDetected(false);
        speechDetectedRef.current = false;
      });
    }
    return Promise.resolve(null);
  }, [isRecording]);

  const startWaveformAnimation = useCallback(() => {
    const animate = () => {
      if (analyserRef.current && isRecording) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Detect speech based on audio levels
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (average > 10) {
          setSpeechDetected(true);
          speechDetectedRef.current = true;
          if (noSpeechTimeoutRef.current) {
            clearTimeout(noSpeechTimeoutRef.current);
            noSpeechTimeoutRef.current = null;
          }
        }

        // Update waveform bars in the DOM - using records.js method
        const waveformBars = document.querySelectorAll(".mobile-waveform-bar");
        if (waveformBars.length > 0) {
          waveformBars.forEach((bar, index) => {
            // Map bar index to frequency data (like records.js)
            const dataIndex = Math.floor(
              (index * dataArray.length) / waveformBars.length
            );
            let amplitude = dataArray[dataIndex] || 0;

            // Normalize amplitude (0-255 to 0-1)
            amplitude = amplitude / 255;

            // Add some baseline activity for visual appeal
            const baselineActivity = 0.1 + Math.random() * 0.1;
            amplitude = Math.max(amplitude, baselineActivity);

            // Apply smoothing for more natural movement
            const smoothingFactor = 0.7;
            const currentHeight = parseFloat(bar.style.height) || 4;
            const targetHeight = 4 + amplitude * 24; // 4px min, 28px max
            const newHeight =
              currentHeight * smoothingFactor +
              targetHeight * (1 - smoothingFactor);

            // Set the height
            bar.style.height = `${Math.round(newHeight)}px`;

            // Add active class for visual feedback
            if (amplitude > 0.3) {
              bar.classList.add("active");
            } else {
              bar.classList.remove("active");
            }
          });
        }

        waveformAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  }, []);

  const stopWaveformAnimation = useCallback(() => {
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }

    // Reset waveform bars to default state (like records.js)
    const waveformBars = document.querySelectorAll(".mobile-waveform-bar");
    waveformBars.forEach((bar) => {
      bar.style.height = "6px";
      bar.classList.remove("active");
    });
  }, []);

  const playRecordedAudio = useCallback(() => {
    if (recordedAudio) {
      const audio = new Audio(URL.createObjectURL(recordedAudio));
      audio.play();
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        console.error("Error playing recorded audio");
      };
    }
  }, [recordedAudio]);

  const clearRecording = useCallback(() => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setSpeechDetected(false);
  }, []);

  const speakText = useCallback((text, rate = 1, pitch = 1) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (noSpeechTimeoutRef.current) {
      clearTimeout(noSpeechTimeoutRef.current);
    }
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.warn("AudioContext already closed:", error);
      }
    }
  }, []);

  return {
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
  };
};
