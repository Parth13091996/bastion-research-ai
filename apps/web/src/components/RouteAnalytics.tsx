import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "@/api/axios";

const RouteAnalytics = () => {
  const location = useLocation();

  // useEffect(() => {
  //   // Fire and forget; analytics should never block navigation
  //   const controller = new AbortController();
  //   const path = location.pathname + (location.search || "");
  //   axios
  //     .post(
  //       "/api/analytics/track",
  //       {
  //         path,
  //         title: document?.title || undefined,
  //         referrer: document?.referrer || undefined,
  //       },
  //       { signal: controller.signal }
  //     )
  //     .catch(() => {});
  //   return () => controller.abort();
  // }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
