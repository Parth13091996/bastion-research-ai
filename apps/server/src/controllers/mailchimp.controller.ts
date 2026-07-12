import { Request, Response } from "express";
import crypto from "crypto";
import mailchimp from "@mailchimp/mailchimp_marketing";
import {
  fetchMailchimpNewsletters,
  getMailchimpNewsletterById,
  getMailchimpErrorInfo,
  isMailchimpAlreadySubscribed,
  isMailchimpResubscribeRequired,
} from "../services/mailchimp.service";
import { supabase } from "../supabase";
import { getSettingsData } from "./settings.controller";
import {
  formatWebinarDateLabel,
  formatWebinarTimeLabel,
} from "../utils/webinar-copy-format";

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

async function fetchHiddenMap(): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from("mailchimp_newsletter_prefs")
      .select("newsletter_id, hidden");
    if (error) return {};
    const map: Record<string, boolean> = {};
    for (const r of data || []) {
      map[(r as any).newsletter_id] = Boolean((r as any).hidden);
    }
    return map;
  } catch {
    return {};
  }
}

export async function listMailchimpNewsletters(req: Request, res: Response) {
  try {
    const force = req.query.force === "true";
    const data = await fetchMailchimpNewsletters({
      forceRefresh: force,
    });
    const hiddenMap = await fetchHiddenMap();
    const isAdmin = (req.originalUrl || "").includes("/api/admin/");
    if (isAdmin) {
      // Attach hidden flag for admin view
      const withHidden = (data ?? []).map((n: any) => ({
        ...n,
        hidden: Boolean(hiddenMap[n.id] || false),
      }));
      return res.status(200).json(withHidden);
    }
    // Public: filter out hidden ones
    const filtered = (data ?? []).filter((n: any) => !hiddenMap[n.id]);
    return res.status(200).json(filtered);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getMailchimpNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = await getMailchimpNewsletterById(id);
    if (!data) {
      return res.status(404).json({ error: "Newsletter not found" });
    }
    // If hidden and public route, block access
    try {
      const isAdmin = (req.originalUrl || "").includes("/api/admin/");
      if (!isAdmin) {
        const { data: pref } = await supabase
          .from("mailchimp_newsletter_prefs")
          .select("hidden")
          .eq("newsletter_id", id)
          .single();
        if (pref && (pref as any).hidden) {
          return res.status(404).json({ error: "Newsletter not found" });
        }
      }
    } catch {}
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

function normalizeMergeFields(
  raw: unknown
): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = String(k).trim().toUpperCase();
    if (!key) continue;
    const val = v == null ? "" : String(v).trim();
    if (val) out[key] = val;
  }
  return Object.keys(out).length ? out : undefined;
}

export async function subscribeToNewsLetter(req: Request, res: Response) {
  try {
    const { email, latitude, longitude, timestamp, tags, merge_fields } =
      req.body;

    // Basic validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t: any) => String(t).trim()).filter(Boolean)
      : typeof tags === "string" && tags.trim()
        ? [tags.trim()]
        : [];

    let normalizedMerge = normalizeMergeFields(merge_fields);

    const hasPortfolioWebinarTag = normalizedTags.some((t) =>
      t.startsWith("Risk_webinar_")
    );
    if (hasPortfolioWebinarTag) {
      const dateTag = process.env.MAILCHIMP_WEBINAR_DATE_MERGE_TAG?.trim();
      const timeTag = process.env.MAILCHIMP_WEBINAR_TIME_MERGE_TAG?.trim();
      if (dateTag || timeTag) {
        try {
          const site = await getSettingsData();
          const extra: Record<string, string> = {
            ...(normalizedMerge || {}),
          };
          if (dateTag && site.mailchimp_webinar_date?.trim()) {
            extra[dateTag.toUpperCase()] = formatWebinarDateLabel(
              site.mailchimp_webinar_date
            );
          }
          if (timeTag && site.mailchimp_webinar_time?.trim()) {
            extra[timeTag.toUpperCase()] = formatWebinarTimeLabel(
              site.mailchimp_webinar_time
            );
          }
          normalizedMerge = Object.keys(extra).length ? extra : normalizedMerge;
        } catch (e) {
          console.error("Mailchimp webinar settings merge:", e);
        }
      }
    }

    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID!;
    const subscriberHash = crypto
      .createHash("md5")
      .update(String(email).toLowerCase())
      .digest("hex");

    const applyTags = async () => {
      if (!normalizedTags.length) return;
      await mailchimp.lists.updateListMemberTags(audienceId, subscriberHash, {
        tags: normalizedTags.map((name) => ({ name, status: "active" })),
      });
    };

    const memberPayload: Parameters<
      typeof mailchimp.lists.addListMember
    >[1] = {
      email_address: email,
      status: "subscribed",
      location: {
        latitude,
        longitude,
      },
      timestamp_signup: timestamp,
      ...(normalizedMerge ? { merge_fields: normalizedMerge } : {}),
    };

    let resubscribeRequired = false;
    let resubscribeDetail: string | undefined;
    try {
      await mailchimp.lists.addListMember(audienceId, memberPayload, {
        skipMergeValidation: true,
      });
    } catch (error: any) {
      const info = getMailchimpErrorInfo(error);
      const alreadySubscribed = isMailchimpAlreadySubscribed(error);
      const needsResubscribe = isMailchimpResubscribeRequired(error);
      if (!alreadySubscribed && !needsResubscribe) {
        throw error;
      }
      if (needsResubscribe) {
        resubscribeRequired = true;
        resubscribeDetail = info.detail || info.title;
      } else if (normalizedMerge) {
        try {
          await mailchimp.lists.updateListMember(audienceId, subscriberHash, {
            merge_fields: normalizedMerge,
          });
        } catch (mergeErr) {
          console.error("Mailchimp merge field update error:", mergeErr);
        }
      }
    }

    if (!resubscribeRequired) {
      try {
        await applyTags();
      } catch (e) {
        console.error("Mailchimp tag update error:", e);
      }
    }

    if (resubscribeRequired) {
      return res.status(200).json({
        message:
          resubscribeDetail ||
          "Contact was previously deleted in Mailchimp and must re-subscribe to join the list.",
        resubscribe_required: true,
      });
    }

    res.json({ message: "Success! Already subscribed or now added." });
  } catch (error: any) {
    console.error("Mailchimp error:", error);
    let message = "Subscription failed";
    if (error.response?.status === 400) {
      message = "Email already subscribed or invalid.";
    } else if (error.response?.status === 401) {
      message = "API key invalid.";
    }
    res.status(error.response?.status || 500).json({ message });
  }
}

// Admin-only: set hidden flag for a Mailchimp newsletter by id
export async function setMailchimpNewsletterHidden(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { hidden } = (req.body || {}) as { hidden?: boolean };
    if (typeof hidden !== "boolean") {
      return res.status(400).json({ message: "hidden boolean is required" });
    }
    const { error } = await supabase
      .from("mailchimp_newsletter_prefs")
      .upsert({ newsletter_id: id, hidden }, { onConflict: "newsletter_id" });
    if (error) return res.status(500).json({ message: "Failed to save" });
    return res.status(200).json({ ok: true, id, hidden });
  } catch (e) {
    return res.status(500).json({ message: "Failed to save" });
  }
}
