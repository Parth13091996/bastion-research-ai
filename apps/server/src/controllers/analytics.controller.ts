import { Request, Response } from "express";
import { supabase } from "../supabase";
import { getClientIp } from "../utils/ip";

interface TrackBody {
  path?: string;
  title?: string;
  referrer?: string;
}

export const trackPageView = async (req: Request, res: Response) => {
  try {
    const { path, title, referrer } = (req.body || {}) as TrackBody;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ message: "Missing path" });
    }

    const ip = getClientIp(req);
    const userId = (req as any).user?.id || null;
    const userAgent = (req.headers["user-agent"] as string) || null;

    // Insert into analytics_pageviews (table should exist; see SQL in README)
    const { error } = await supabase.from("analytics_pageviews").insert({
      path,
      title: title || null,
      referrer: referrer || null,
      ip,
      user_id: userId,
      user_agent: userAgent,
      occurred_at: new Date().toISOString(),
    } as any);

    if (error) {
      // Don't break the app because of analytics
      console.error("Analytics insert error:", error?.message || error);
      return res.status(202).json({ message: "Accepted (not recorded)" });
    }

    return res.status(201).json({ ok: true });
  } catch (e) {
    // Fail open
    console.error("Analytics track error:", e);
    return res.status(202).json({ message: "Accepted (not recorded)" });
  }
};

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));
    const since = new Date();
    since.setDate(since.getDate() - days + 1);

    // We will fetch raw rows since the supabase-js v2 client has limited agg helpers without SQL
    const { data: rows, error } = await supabase
      .from("analytics_pageviews")
      .select("occurred_at, path, ip, user_id")
      .gte("occurred_at", since.toISOString());

    if (error) {
      return res.status(500).json({ message: "Failed to load analytics" });
    }

    // Aggregate in-memory
    const byDay: Record<string, { total: number; uniqueIPs: Set<string>; uniqueUsers: Set<string> }> = {};
    const topPaths: Record<string, { views: number; ips: Set<string>; users: Set<string> }> = {};
    const allIps = new Set<string>();
    const allUsers = new Set<string>();

    const now = Date.now();
    let activeIps = new Set<string>();
    let activeUsers = new Set<string>();

    for (const r of rows || []) {
      const d = new Date(r.occurred_at);
      const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay[dayKey] ||= { total: 0, uniqueIPs: new Set(), uniqueUsers: new Set() };
      byDay[dayKey].total += 1;
      if (r.ip) {
        byDay[dayKey].uniqueIPs.add(r.ip);
        allIps.add(r.ip);
      }
      if (r.user_id) {
        byDay[dayKey].uniqueUsers.add(r.user_id);
        allUsers.add(r.user_id);
      }

      const pathKey = r.path || "";
      topPaths[pathKey] ||= { views: 0, ips: new Set(), users: new Set() };
      topPaths[pathKey].views += 1;
      if (r.ip) topPaths[pathKey].ips.add(r.ip);
      if (r.user_id) topPaths[pathKey].users.add(r.user_id);

      // Active in last 5 minutes
      if (now - d.getTime() <= 5 * 60 * 1000) {
        if (r.ip) activeIps.add(r.ip);
        if (r.user_id) activeUsers.add(r.user_id);
      }
    }

    const visitsByDay = Object.keys(byDay)
      .sort()
      .map((k) => ({
        date: k,
        totalViews: byDay[k].total,
        uniqueIPs: byDay[k].uniqueIPs.size,
        uniqueUsers: byDay[k].uniqueUsers.size,
      }));

    const usersByDay = visitsByDay.map((v) => ({ date: v.date, uniqueUsers: v.uniqueUsers }));

    const topPathsArr = Object.entries(topPaths)
      .map(([path, v]) => ({ path, views: v.views, uniqueIPs: v.ips.size, uniqueUsers: v.users.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return res.status(200).json({
      rangeDays: days,
      visitsByDay,
      usersByDay,
      topPaths: topPathsArr,
      activeNow: { ips: activeIps.size, users: activeUsers.size },
      totals: { uniqueIPs: allIps.size, uniqueUsers: allUsers.size },
    });
  } catch (e) {
    console.error("Analytics summary error:", e);
    return res.status(500).json({ message: "Failed to aggregate analytics" });
  }
};
