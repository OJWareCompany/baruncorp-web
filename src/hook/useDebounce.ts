import { useState, useEffect, useRef } from "react";

export default function useDebounce(value: string, delay: number = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export function useDebounceWithHandler(delay: number = 500) {
  const [debounced, setDebounced] = useState("");
  const debounceTimer = useRef<number | null>(null);

  const onValueChange = (value: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      setDebounced(value);
    }, delay);
  };

  const clear = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setDebounced("");
  };

  return {
    debounced,
    onValueChange,
    clear,
  };
}
