import { create } from "zustand";

interface LoaderState {
  isLoading: boolean;
  counter: number;
  start: () => void;
  stop: () => void;
  withLoader: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoaderStore = create<LoaderState>((set, get) => ({
  isLoading: false,
  counter: 0,

  start: () => {
    const { counter } = get();
    set({
      counter: counter + 1,
      isLoading: true,
    });
  },

  stop: () => {
    const { counter } = get();
    const newCounter = Math.max(0, counter - 1);
    set({
      counter: newCounter,
      isLoading: false,
    });
  },

  withLoader: async <T>(promise: Promise<T>): Promise<T> => {
    const { start, stop } = get();
    start();
    try {
      return await promise;
    } finally {
      stop();
    }
  },
}));
