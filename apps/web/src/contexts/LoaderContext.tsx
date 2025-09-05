import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type LoaderContextType = {
  isLoading: boolean;
  message?: string;
  start: (msg?: string) => void;
  stop: () => void;
  // Utility to wrap a promise and show loader automatically
  withLoader: <T>(p: Promise<T>, msg?: string) => Promise<T>;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  // Track concurrent calls to avoid flicker when multiple start/stop happen
  const counterRef = useRef(0);

  const start = useCallback((msg?: string) => {
    counterRef.current += 1;
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const stop = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setIsLoading(false);
      setMessage(undefined);
    }
  }, []);

  const withLoader = useCallback(
    async <T,>(p: Promise<T>, msg?: string) => {
      start(msg);
      try {
        return await p;
      } finally {
        stop();
      }
    },
    [start, stop]
  );

  const value = useMemo(
    () => ({ isLoading, message, start, stop, withLoader }),
    [isLoading, message, start, stop, withLoader]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within LoaderProvider");
  return ctx;
};

