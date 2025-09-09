import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLoaderStore } from "@/stores/loaderStore";

const Loader = () => {
  const { isLoading, message } = useLoaderStore();

  // Prevent body scroll when loader is open
  useEffect(() => {
    if (isLoading) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white shadow-md">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}
      </div>
    </div>,
    document.body
  );
};

export default Loader;

