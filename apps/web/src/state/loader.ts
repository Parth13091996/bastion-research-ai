import { atom } from "jotai";

export type LoaderState = {
  isLoading: boolean;
  message?: string;
  counter: number;
};

const initialLoaderState: LoaderState = {
  isLoading: false,
  message: undefined,
  counter: 0,
};

export const loaderStateAtom = atom<LoaderState>(initialLoaderState);

export const startLoaderAtom = atom(null, (get, set, message?: string) => {
  const current = get(loaderStateAtom);
  const counter = current.counter + 1;
  set(loaderStateAtom, {
    counter,
    isLoading: true,
    message,
  });
});

export const stopLoaderAtom = atom(null, (get, set) => {
  const current = get(loaderStateAtom);
  const counter = Math.max(0, current.counter - 1);
  set(loaderStateAtom, {
    counter,
    isLoading: counter > 0,
    message: counter > 0 ? current.message : undefined,
  });
});

export const resetLoaderAtom = atom(null, (_get, set) => {
  set(loaderStateAtom, initialLoaderState);
});
