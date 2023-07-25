import { useState, useEffect } from "react";
import useIsFirstRender from "./useIsFirstRender";

export default function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (isFirstRender) {
      return;
    }

    if (value === "") {
      clear();
      return;
    }

    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setIsDebouncing(false);
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, isFirstRender]);

  const clear = () => {
    setDebouncedValue("");
    setIsDebouncing(false);
  };

  return { debouncedValue, isDebouncing, clear };
}
