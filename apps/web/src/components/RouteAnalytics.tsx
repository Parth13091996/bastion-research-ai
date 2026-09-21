import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "@/api/axios";

const RouteAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track public pages (skip admin and user dashboards)
    const pathname = location.pathname || "";
    if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
      return;
    }

    // Fire and forget; analytics should never block navigation
    const controller = new AbortController();
    const path = pathname + (location.search || "");
    axios
      .post(
        "/api/analytics/track",
        {
          path,
          title: typeof document !== "undefined" ? document.title : undefined,
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
        },
        { signal: controller.signal }
      )
      .catch(() => {
        // swallow errors; analytics must not interfere with UX
      });
    return () => controller.abort();
  }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
