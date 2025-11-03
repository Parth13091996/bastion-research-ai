import { Request, Response } from "express";
import { supabase } from "../supabase";

// Returns per-user activity summary suitable for the Manage Members table
// Fields: user_id, login_count, pageviews_count, recommendations_count
export const getUserActivitySummary = async (req: Request, res: Response) => {
  try {
    // Aggregate pageviews from analytics_pageviews (if table exists)
    let pageviewsByUser = new Map<string, number>();
    try {
      const { data: pvs, error: pvErr } = await supabase
        .from("analytics_pageviews")
        .select("user_id")
        .not("user_id", "is", null);
      if (!pvErr) {
        for (const r of pvs || []) {
          const uid = (r as any).user_id as string;
          if (!uid) continue;
          pageviewsByUser.set(uid, (pageviewsByUser.get(uid) || 0) + 1);
        }
      }
    } catch {}

    // Aggregate events from user_activity (if table exists)
    const loginByUser = new Map<string, number>();
    const recoByUser = new Map<string, number>();
    try {
      const { data: evs, error: evErr } = await supabase
        .from("user_activity")
        .select("user_id, event_type")
        .not("user_id", "is", null);
      if (!evErr) {
        for (const r of evs || []) {
          const uid = (r as any).user_id as string;
          const t = (r as any).event_type as string;
          if (!uid || !t) continue;
          if (t === "login") loginByUser.set(uid, (loginByUser.get(uid) || 0) + 1);
          if (t === "recommendation_view")
            recoByUser.set(uid, (recoByUser.get(uid) || 0) + 1);
        }
      }
    } catch {}

    // Build response array (include users seen in either map)
    const allUserIds = new Set<string>();
    for (const k of pageviewsByUser.keys()) allUserIds.add(k);
    for (const k of loginByUser.keys()) allUserIds.add(k);
    for (const k of recoByUser.keys()) allUserIds.add(k);

    const result = Array.from(allUserIds).map((user_id) => ({
      user_id,
      login_count: loginByUser.get(user_id) || 0,
      pageviews_count: pageviewsByUser.get(user_id) || 0,
      recommendations_count: recoByUser.get(user_id) || 0,
    }));

    return res.status(200).json(result);
  } catch (e) {
    console.error("User activity summary error:", e);
    return res.status(500).json({ message: "Failed to load activity summary" });
  }
};

