import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - The debounce delay in milliseconds
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  const cancelDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateValue = useCallback(
    (newValue) => {
      cancelDebounce();
      timerRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
        timerRef.current = null;
      }, delay);
    },
    [delay, cancelDebounce]
  );

  // Update debounced value when input value changes
  useState(() => {
    updateValue(value);
  });

  // Cleanup on unmount
  useState(() => {
    return () => {
      cancelDebounce();
    };
  });

  return debouncedValue;
};

/**
 * Hook function version for imperative usage
 */
export const debounce = (func, delay = 300) => {
  let timeoutId = null;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

export default useDebounce;
