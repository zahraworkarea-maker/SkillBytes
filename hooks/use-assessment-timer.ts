import { useEffect, useState, useCallback } from 'react';

interface UseAssessmentTimerOptions {
  initialTimeLimit: number; // in minutes
  onTimeUp?: () => void;
}

export function useAssessmentTimer({ initialTimeLimit, onTimeUp }: UseAssessmentTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeLimit * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Format time for display (MM:SS)
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Get time status: 'normal' | 'warning' | 'critical'
  const getTimeStatus = useCallback((): 'normal' | 'warning' | 'critical' => {
    const totalSeconds = initialTimeLimit * 60;
    const percentage = (timeRemaining / totalSeconds) * 100;

    if (percentage <= 10) return 'critical';
    if (percentage <= 25) return 'warning';
    return 'normal';
  }, [timeRemaining, initialTimeLimit]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || isTimeUp) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsTimeUp(true);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isTimeUp, onTimeUp]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (!isTimeUp) {
      setIsRunning(true);
    }
  }, [isTimeUp]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(initialTimeLimit * 60);
    setIsRunning(true);
    setIsTimeUp(false);
  }, [initialTimeLimit]);

  return {
    timeRemaining,
    isRunning,
    isTimeUp,
    formattedTime: formatTime(timeRemaining),
    timeStatus: getTimeStatus(),
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  };
}
