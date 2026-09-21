import { Request, Response } from "express";
import { supabase } from "../supabase";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;

const parsePositiveInteger = (value: unknown, fallback: number) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Read-only member export for CRM integrations. Deliberately excludes passwords,
 * PAN, date of birth, and postal addresses.
 */
export const getPublicMembers = async (req: Request, res: Response) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const requestedPageSize = parsePositiveInteger(
    req.query.page_size,
    DEFAULT_PAGE_SIZE,
  );

  if (page === null || requestedPageSize === null) {
    return res
      .status(400)
      .json({ error: "page and page_size must be positive integers" });
  }

  if (requestedPageSize > MAX_PAGE_SIZE) {
    return res
      .status(400)
      .json({ error: `page_size cannot exceed ${MAX_PAGE_SIZE}` });
  }

  const updatedSince = req.query.updated_since;
  if (
    updatedSince !== undefined &&
    (typeof updatedSince !== "string" || Number.isNaN(Date.parse(updatedSince)))
  ) {
    return res.status(400).json({ error: "updated_since must be an ISO date" });
  }

  const status = req.query.status;
  const role = req.query.role;
  if (
    (status !== undefined && typeof status !== "string") ||
    (role !== undefined && typeof role !== "string")
  ) {
    return res.status(400).json({ error: "status and role must be strings" });
  }

  const offset = (page - 1) * requestedPageSize;

  try {
    let query = supabase
      .from("users")
      .select(
        `
          id,
          username,
          email,
          first_name,
          last_name,
          phone,
          company,
          role,
          status,
          plan_id,
          subscription_start_date,
          subscription_end_date,
          created_at,
          updated_at,
          membership_plans (
            plan_code,
            plan_id
          )
        `,
        { count: "exact" },
      )
      .order("updated_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + requestedPageSize - 1);

    if (status) query = query.eq("status", status);
    if (role) query = query.eq("role", role);
    if (typeof updatedSince === "string") {
      query = query.gte("updated_at", new Date(updatedSince).toISOString());
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("getPublicMembers database error:", error);
      return res.status(500).json({ error: "Failed to retrieve members" });
    }

    const total = count ?? 0;
    return res
      .status(200)
      .set("Cache-Control", "private, no-store")
      .json({
        data: data ?? [],
        pagination: {
          page,
          page_size: requestedPageSize,
          total,
          total_pages: Math.ceil(total / requestedPageSize),
        },
      });
  } catch (error) {
    console.error("getPublicMembers error:", error);
    return res.status(500).json({ error: "Failed to retrieve members" });
  }
};
