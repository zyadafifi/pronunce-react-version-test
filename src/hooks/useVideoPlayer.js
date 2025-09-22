import { useState, useRef, useCallback, useEffect } from "react";

export const useVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef(null);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const replay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const setVideoSource = useCallback((src) => {
    if (videoRef.current && src) {
      setIsLoading(true);
      setHasError(false);
      videoRef.current.src = src;
      videoRef.current.load();
    }
  }, []);

  const seekTo = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Format time helper
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    hasError,
    play,
    pause,
    replay,
    setVideoSource,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    // Event handlers
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  };
};


