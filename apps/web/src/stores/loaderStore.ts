import { create } from 'zustand'

interface LoaderState {
  isLoading: boolean
  message?: string
  counter: number
  start: (msg?: string) => void
  stop: () => void
  withLoader: <T>(promise: Promise<T>, msg?: string) => Promise<T>
}

export const useLoaderStore = create<LoaderState>((set, get) => ({
  isLoading: false,
  message: undefined,
  counter: 0,
  
  start: (msg?: string) => {
    const { counter } = get()
    set({
      counter: counter + 1,
      message: msg,
      isLoading: true,
    })
  },
  
  stop: () => {
    const { counter } = get()
    const newCounter = Math.max(0, counter - 1)
    set({
      counter: newCounter,
      isLoading: newCounter > 0,
      message: newCounter > 0 ? get().message : undefined,
    })
  },
  
  withLoader: async <T,>(promise: Promise<T>, msg?: string): Promise<T> => {
    const { start, stop } = get()
    start(msg)
    try {
      return await promise
    } finally {
      stop()
    }
  },
}))