import { useState, useEffect, useRef } from "react";

export default function useDebounce(value: string, delay: number = 3000) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isInitialRef = useRef(true);

  useEffect(() => {
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
  }, [value, delay]);

  return { debouncedValue, isDebouncing };
}
