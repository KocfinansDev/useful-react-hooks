import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Returns before useEffect triggers, hence returns the previous value
  return ref.current;
}