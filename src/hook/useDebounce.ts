import { useState, useEffect } from "react";

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
  let debounceTimer: number | null = null;

  const onValueChange = (value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      setDebounced(value);
    }, delay);
  };

  const clear = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setDebounced("");
  };

  return {
    debounced,
    onValueChange,
    clear,
  };
}
