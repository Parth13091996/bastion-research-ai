import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLoaderStore } from "@/stores/loader-store";

const Loader = () => {
  const isLoading = useLoaderStore((state) => state.isLoading);

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

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <Loader2 className="h-12 w-12 animate-spin text-secondary" />
    </div>
  );
};

export default Loader;
