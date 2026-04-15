import { useRef, useEffect } from 'react';

export const useAutoScroll = (enabled = false, speed = 100) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        window.scrollBy(0, 1);
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, speed]);

  return intervalRef;
};