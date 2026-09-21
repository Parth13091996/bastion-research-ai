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

// Returns detailed page visits for a specific user with frequency
// Returns: { path: string, title: string, visits: number }[]
export const getUserPageVisits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch all page views for this user
    const { data: pageviews, error } = await supabase
      .from("analytics_pageviews")
      .select("path, title")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("Error fetching page visits:", error);
      return res.status(500).json({ message: "Failed to fetch page visits" });
    }

    // Aggregate by path and count frequency
    const pathMap = new Map<string, { title: string; visits: number }>();

    for (const pv of pageviews || []) {
      const path = (pv as any).path as string;
      const title = (pv as any).title as string;

      if (!path) continue;

      if (pathMap.has(path)) {
        pathMap.get(path)!.visits += 1;
      } else {
        pathMap.set(path, { title: title || path, visits: 1 });
      }
    }

    // Convert to array and sort by frequency (most visited first)
    const result = Array.from(pathMap.entries())
      .map(([path, data]) => ({
        path,
        title: data.title,
        visits: data.visits,
      }))
      .sort((a, b) => b.visits - a.visits);

    return res.status(200).json(result);
  } catch (e) {
    console.error("User page visits error:", e);
    return res.status(500).json({ message: "Failed to load page visits" });
  }
};

// Returns detailed recommendation visits for a specific user with frequency
// Returns: { recommendation_id: string, recommendation_title: string, visits: number }[]
export const getUserRecommendationVisits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch all recommendation views for this user
    const { data: recViews, error } = await supabase
      .from("user_activity")
      .select("subject_id")
      .eq("user_id", userId)
      .eq("event_type", "recommendation_view")
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("Error fetching recommendation visits:", error);
      return res.status(500).json({ message: "Failed to fetch recommendation visits" });
    }

    // Aggregate by recommendation ID and count frequency
    const recMap = new Map<string, number>();

    for (const rv of recViews || []) {
      const recId = (rv as any).subject_id as string;
      if (!recId) continue;
      recMap.set(recId, (recMap.get(recId) || 0) + 1);
    }

    // Fetch recommendation titles for each unique ID
    const recIds = Array.from(recMap.keys());
    const result: Array<{ recommendation_id: string; recommendation_title: string; visits: number }> = [];

    for (const recId of recIds) {
      try {
        const { data: rec, error: recError } = await supabase
          .from("recommendations")
          .select("id, title")
          .eq("id", recId)
          .single();

        if (!recError && rec) {
          result.push({
            recommendation_id: recId,
            recommendation_title: (rec as any).title || `Recommendation ${recId}`,
            visits: recMap.get(recId) || 0,
          });
        } else {
          // If recommendation not found, still include it with a fallback title
          result.push({
            recommendation_id: recId,
            recommendation_title: `Recommendation ${recId}`,
            visits: recMap.get(recId) || 0,
          });
        }
      } catch {
        result.push({
          recommendation_id: recId,
          recommendation_title: `Recommendation ${recId}`,
          visits: recMap.get(recId) || 0,
        });
      }
    }

    // Sort by frequency (most visited first)
    result.sort((a, b) => b.visits - a.visits);

    return res.status(200).json(result);
  } catch (e) {
    console.error("User recommendation visits error:", e);
    return res.status(500).json({ message: "Failed to load recommendation visits" });
  }
};

