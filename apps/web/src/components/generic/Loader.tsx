import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLoaderStore } from "@/stores/loader-store";

const Loader = () => {
  const isLoading = useLoaderStore((state) => state.isLoading);
  const message = useLoaderStore((state) => state.message);

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

  // Render inline (no portals) as an app-level overlay
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white shadow-xl border border-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        {message ? (
          <p className="text-sm text-gray-700">{message}</p>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Loader;
