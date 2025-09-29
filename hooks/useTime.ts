
import { useState, useEffect } from 'react';

export const useTime = (refreshInterval: number = 100): Date => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return time;
};
