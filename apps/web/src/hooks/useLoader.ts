import { useLoaderStore } from '@/stores/loaderStore'

export const useLoader = () => {
  const { start, stop, withLoader } = useLoaderStore()
  
  return {
    start,
    stop,
    withLoader,
  }
}