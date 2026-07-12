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
    const user = (req as any).user || null;
    const userId = user?.id || null;
    const userAgent = (req.headers["user-agent"] as string) || null;

    // Do not record analytics for admin users
    if (user && user.role === "admin") {
      return res.status(202).json({ message: "Accepted (admin not recorded)" });
    }

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
    const sinceIso = since.toISOString();

    // Fetch all matching rows in deterministic pages to avoid the default 1000-row cap
    const PAGE_SIZE = 1000;
    let from = 0;
    const rows: {
      occurred_at: string;
      path: string | null;
      ip: string | null;
      user_id: string | null;
    }[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("analytics_pageviews")
        .select("occurred_at, path, ip, user_id")
        .gte("occurred_at", sinceIso)
        .order("occurred_at", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Analytics summary fetch error:", error);
        return res.status(500).json({ message: "Failed to load analytics" });
      }

      if (!data || data.length === 0) {
        break;
      }

      rows.push(
        ...(data as any[]).map((r) => ({
          occurred_at: (r as any).occurred_at as string,
          path: ((r as any).path as string | null) ?? null,
          ip: ((r as any).ip as string | null) ?? null,
          user_id: ((r as any).user_id as string | null) ?? null,
        }))
      );

      if (data.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    // Aggregate in-memory
    const byDay: Record<
      string,
      {
        total: number;
        uniqueUsers: Set<string | null>;
        uniqueIps: Set<string | null>;
      }
    > = {};
    const topPaths: Record<
      string,
      {
        views: number;
        users: Set<string | null>;
        ips: Set<string | null>;
      }
    > = {};
    const allUsers = new Set<string | null>();
    const allIps = new Set<string | null>();

    const now = Date.now();
    const activeUsers = new Set<string | null>();
    const activeIps = new Set<string | null>();

    for (const r of rows) {
      const d = new Date(r.occurred_at);
      const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay[dayKey] ||= {
        total: 0,
        uniqueUsers: new Set(),
        uniqueIps: new Set(),
      };
      byDay[dayKey].total += 1;
      const userId = r.user_id ?? null;
      const ip = r.ip ?? null;
      byDay[dayKey].uniqueUsers.add(userId);
      byDay[dayKey].uniqueIps.add(ip);
      allUsers.add(userId);
      allIps.add(ip);

      const pathKey = r.path || "";
      topPaths[pathKey] ||= { views: 0, users: new Set(), ips: new Set() };
      topPaths[pathKey].views += 1;
      topPaths[pathKey].users.add(userId);
      topPaths[pathKey].ips.add(ip);

      // Active in last 5 minutes
      if (now - d.getTime() <= 5 * 60 * 1000) {
        activeUsers.add(userId);
        activeIps.add(ip);
      }
    }

    // Remove null from sets for stats where identifiers do not exist
    function countUniqueWithoutNull(set: Set<string | null>): number {
      const filtered = Array.from(set).filter(
        (u) => u !== null && u !== undefined
      );
      return filtered.length;
    }

    const visitsByDay = Object.keys(byDay)
      .sort()
      .map((k) => ({
        date: k,
        totalViews: byDay[k].total,
        uniqueUsers: countUniqueWithoutNull(byDay[k].uniqueUsers),
        uniqueIPs: countUniqueWithoutNull(byDay[k].uniqueIps),
      }));

    const usersByDay = visitsByDay.map((v) => ({
      date: v.date,
      uniqueUsers: v.uniqueUsers,
    }));

    const topPathsArr = Object.entries(topPaths)
      .map(([path, v]) => ({
        path,
        views: v.views,
        uniqueUsers: countUniqueWithoutNull(v.users),
        uniqueIPs: countUniqueWithoutNull(v.ips),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // ===== Membership/Revenue analytics =====
    const nowIso = new Date().toISOString();

    // Fetch payment history (latest first per user) and derive subscription-like rows
    const { data: paymentsRows, error: paymentsError } = await supabase
      .from("payment_history")
      .select(
        `
        user_id,
        plan_id,
        transaction_status,
        created_at,
        membership_plans!payment_history_plan_id_fkey (
          plan_id,
          plan_name,
          plan_code,
          price_amount,
          currency,
          tier,
          duration_months
        )
      `
      )
      .order("created_at", { ascending: false });

    if (paymentsError) {
      return res
        .status(500)
        .json({ message: "Failed to load payment history" });
    }

    // Derive subscription-like rows from payment history + plans
    const subsRows =
      paymentsRows?.map((p: any) => {
        const plan = p.membership_plans || {};
        const startDate = p.created_at;
        let expireNextRenewal: string | null = null;
        if (
          startDate &&
          typeof plan.duration_months === "number" &&
          plan.duration_months > 0
        ) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + plan.duration_months);
          expireNextRenewal = d.toISOString();
        }
        return {
          user_id: p.user_id,
          start_date: startDate,
          expire_next_renewal: expireNextRenewal,
          amount: plan.price_amount ?? 0,
          membership_id: p.plan_id,
          plan_code: plan.plan_code || null,
        };
      }) || [];

    // Fetch plans for price and product mapping
    const { data: plansRows } = await supabase
      .from("membership_plans")
      .select("plan_id, plan_name, plan_code, price_amount, currency, tier");
    const planById: Record<string, any> = {};
    for (const p of plansRows || []) planById[String(p.plan_id)] = p;

    // Build latest subscription per user
    const latestByUser = new Map<string, any>();
    for (const s of subsRows || []) {
      if (!latestByUser.has(s.user_id)) latestByUser.set(s.user_id, s);
    }

    const isActive = (s: any) => {
      if (!s) return false;
      if (!s.expire_next_renewal) return true; // open-ended
      return new Date(s.expire_next_renewal).getTime() > Date.now();
    };

    const isPaid = (s: any) => {
      if (!s) return false;
      if (typeof s.amount === "number") return s.amount > 0;
      const plan = s.membership_id ? planById[String(s.membership_id)] : null;
      return (plan?.price_amount || 0) > 0;
    };

    const totalActiveSubscribers = Array.from(latestByUser.values()).filter(
      (s) => isActive(s)
    ).length;
    const totalPaidSubscribers = Array.from(latestByUser.values()).filter(
      (s) => isActive(s) && isPaid(s)
    ).length;

    // New paid subscribers within windows
    const withinDays = (dateIso: string | null | undefined, d: number) => {
      if (!dateIso) return false;
      const dt = new Date(dateIso).getTime();
      return Date.now() - dt <= d * 24 * 60 * 60 * 1000;
    };
    const newPaid7 = (subsRows || []).filter(
      (s) => isPaid(s) && withinDays(s.start_date, 7)
    ).length;
    const newPaid30 = (subsRows || []).filter(
      (s) => isPaid(s) && withinDays(s.start_date, 30)
    ).length;
    const newPaid90 = (subsRows || []).filter(
      (s) => isPaid(s) && withinDays(s.start_date, 90)
    ).length;

    // Renewal vs Non-Renewal over last 1 year (approx)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const subsByUserAll = new Map<string, any[]>();
    for (const s of subsRows || []) {
      const arr = subsByUserAll.get(s.user_id) || [];
      arr.push(s);
      subsByUserAll.set(s.user_id, arr);
    }
    let eligibleRenewal = 0;
    let renewed = 0;
    const nowMs = Date.now();
    for (const [, list] of subsByUserAll) {
      list.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      const first = list[0];
      if (first && nowMs - new Date(first.start_date).getTime() >= oneYearMs) {
        eligibleRenewal += 1;
        if (list.length >= 2) renewed += 1;
      }
    }
    const renewalPct = eligibleRenewal
      ? Math.round((renewed / eligibleRenewal) * 100)
      : 0;
    const nonRenewalPct = 100 - renewalPct;

    // Churn rate (monthly approximation): users whose last sub expired in last 30d and not renewed
    let churnNumerator = 0;
    let churnDenominator = 0;
    for (const [, list] of subsByUserAll) {
      list.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      const last = list[list.length - 1];
      if (!last) continue;
      if (last.expire_next_renewal) {
        const expMs = new Date(last.expire_next_renewal).getTime();
        const delta = Date.now() - expMs;
        if (delta >= 0 && delta <= 30 * 24 * 60 * 60 * 1000) {
          churnDenominator += 1;
          // if not active, treat as churned
          if (!isActive(last)) churnNumerator += 1;
        }
      }
    }
    const churnRateMonthly = churnDenominator
      ? Math.round((churnNumerator / churnDenominator) * 100)
      : 0;

    // Subscribers nearing renewal in next 30 days
    const nearingRenewalRaw = (subsRows || [])
      .filter((s) => !!s.expire_next_renewal)
      .filter((s) => {
        const exp = new Date(s.expire_next_renewal!).getTime();
        const now = Date.now();
        return exp > now && exp - now <= 30 * 24 * 60 * 60 * 1000;
      })
      .slice(0, 50);

    const nearingRenewalIds = Array.from(new Set(nearingRenewalRaw.map(s => s.user_id).filter(Boolean)));
    const userEmails: Record<string, string> = {};
    if (nearingRenewalIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, email")
        .in("id", nearingRenewalIds);
      if (usersData) {
        for (const u of usersData) {
          userEmails[u.id] = u.email;
        }
      }
    }

    const nearingRenewal = nearingRenewalRaw.map((s) => ({
      userId: s.user_id,
      email: userEmails[s.user_id] || null,
      membershipId: s.membership_id,
      //@ts-ignore
      planCode: s.plan_code || null,
      expiresAt: s.expire_next_renewal,
    }));

    // Revenue metrics based on subscriptions amounts (payment success path populates these)
    const withinPeriod = (iso: string | null | undefined, start: Date) => {
      if (!iso) return false;
      return new Date(iso).getTime() >= start.getTime();
    };
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfQuarter = new Date();
    const q = Math.floor(startOfQuarter.getMonth() / 3);
    startOfQuarter.setMonth(q * 3, 1);
    startOfQuarter.setHours(0, 0, 0, 0);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const sumAmounts = (list: any[]) =>
      list.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    const totalRevenueMonth = sumAmounts(
      (subsRows || []).filter((s) => withinPeriod(s.start_date, startOfMonth))
    );
    const totalRevenueQuarter = sumAmounts(
      (subsRows || []).filter((s) => withinPeriod(s.start_date, startOfQuarter))
    );
    const totalRevenueYTD = sumAmounts(
      (subsRows || []).filter((s) => withinPeriod(s.start_date, startOfYear))
    );

    // Revenue by product (plan)
    const revenueByProductMap: Record<
      string,
      { product: string; revenue: number }
    > = {};
    for (const s of subsRows || []) {
      const plan = s.membership_id ? planById[String(s.membership_id)] : null;
      const key = plan?.plan_name || String(s.membership_id || "Unknown");
      revenueByProductMap[key] ||= { product: key, revenue: 0 };
      revenueByProductMap[key].revenue += Number(s.amount) || 0;
    }
    const revenueByProduct = Object.values(revenueByProductMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return res.status(200).json({
      rangeDays: days,
      visitsByDay,
      usersByDay,
      topPaths: topPathsArr,
      activeNow: {
        ips: countUniqueWithoutNull(activeIps),
        users: countUniqueWithoutNull(activeUsers),
      },
      totals: {
        uniqueIPs: countUniqueWithoutNull(allIps),
        uniqueUsers: countUniqueWithoutNull(allUsers),
      },
      // Business metrics
      subscribers: {
        totalActive: totalActiveSubscribers,
        totalPaidActive: totalPaidSubscribers,
        newPaid: { last7: newPaid7, last30: newPaid30, last90: newPaid90 },
        renewalPct: renewalPct,
        nonRenewalPct: nonRenewalPct,
        churnRateMonthly,
        nearingRenewal,
      },
      revenue: {
        month: totalRevenueMonth,
        quarter: totalRevenueQuarter,
        YTD: totalRevenueYTD,
        byProduct: revenueByProduct,
      },
      generatedAt: nowIso,
    });
  } catch (e) {
    console.error("Analytics summary error:", e);
    return res.status(500).json({ message: "Failed to aggregate analytics" });
  }
};
