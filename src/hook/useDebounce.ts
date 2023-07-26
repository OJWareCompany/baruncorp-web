import { useState, useEffect, useRef } from "react";

export default function useDebounce(
  value: string,
  enabled = true,
  delay: number = 5000
) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isInitialRef = useRef(true);

  useEffect(() => {
    if (!enabled) {
      setIsDebouncing(false);
      isInitialRef.current = true;
      return;
    }

    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }

    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setIsDebouncing(false);
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, enabled]);

  return { debouncedValue, isDebouncing };
}
