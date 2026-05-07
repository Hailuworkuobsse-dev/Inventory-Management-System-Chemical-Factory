import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for monitoring online/offline status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChecked(new Date());
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChecked(new Date());
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(() => {
    const currentlyOnline = navigator.onLine;
    setIsOnline(currentlyOnline);
    setLastChecked(new Date());
    return currentlyOnline;
  }, []);

  return {
    isOnline,
    lastChecked,
    checkConnection,
  };
};

export default useOnlineStatus;
