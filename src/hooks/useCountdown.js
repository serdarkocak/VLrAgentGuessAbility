import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds, { onExpire, autoStart = false } = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setSeconds(initialSeconds);
    setRunning(true);
  }, [clear, initialSeconds]);

  const pause = useCallback(() => {
    setRunning(false);
    clear();
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setSeconds(initialSeconds);
    setRunning(false);
  }, [clear, initialSeconds]);

  useEffect(() => {
    if (!running) return undefined;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [running, clear]);

  return {
    seconds,
    running,
    start,
    pause,
    reset,
    progress: initialSeconds > 0 ? seconds / initialSeconds : 0,
  };
}
