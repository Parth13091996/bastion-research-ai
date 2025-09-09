import { useLoaderStore } from "@/stores/loaderStore";

export const useLoader = () => {
  const start = useLoaderStore((state) => state.start);
  const stop = useLoaderStore((state) => state.stop);
  const withLoader = useLoaderStore((state) => state.withLoader);

  return {
    start,
    stop,
    withLoader,
  };
};
