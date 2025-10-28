import { useState, useEffect, useCallback } from 'react';

interface TimerData {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  isExpired: boolean;
  timeLeft: string;
}

interface UseRealTimeTimerProps {
  startTime: string; // ISO string
  durationHours: number; // 24 for 24h, 3 for pushim, etc.
  isActive: boolean;
  updateInterval?: number; // milliseconds, default 1000 (1 second)
}

export const useRealTimeTimer = ({
  startTime,
  durationHours,
  isActive,
  updateInterval = 1000
}: UseRealTimeTimerProps): TimerData => {
  const [timerData, setTimerData] = useState<TimerData>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMinutes: 0,
    isExpired: false,
    timeLeft: '0h 0m 0s'
  });

  const calculateTimeLeft = useCallback(() => {
    if (!isActive || !startTime || startTime === '') {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMinutes: 0,
        isExpired: true,
        timeLeft: 'Nuk është aktiv'
      };
    }

    const start = new Date(startTime);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    
    const totalDurationSeconds = durationHours * 60 * 60;
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const isExpired = remainingSeconds <= 0;

    return {
      hours,
      minutes,
      seconds,
      totalMinutes: Math.floor(remainingSeconds / 60),
      isExpired,
      timeLeft: isExpired ? 'Koha Skadoi' : `${hours}h ${minutes}m ${seconds}s`
    };
  }, [startTime, durationHours, isActive]);

  useEffect(() => {
    if (!isActive || !startTime || startTime === '') {
      setTimerData({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMinutes: 0,
        isExpired: true,
        timeLeft: 'Nuk është aktiv'
      });
      return;
    }

    // Calculate immediately
    const initialData = calculateTimeLeft();
    setTimerData(initialData);

    // Set up interval for updates
    const interval = setInterval(() => {
      const newData = calculateTimeLeft();
      setTimerData(newData);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive, startTime, calculateTimeLeft, updateInterval]);

  return timerData;
};

export default useRealTimeTimer;
