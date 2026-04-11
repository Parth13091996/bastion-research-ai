import mailchimp from "@mailchimp/mailchimp_marketing";
import { MailchimpNewsletter } from "@repo/types";

// Configure Mailchimp client once per module use
function configureMailchimp() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const server = process.env.MAILCHIMP_SERVER_PREFIX;
  if (!apiKey || !server) {
    throw new Error(
      "MAILCHIMP_API_KEY or MAILCHIMP_SERVER_PREFIX is not configured"
    );
  }
  mailchimp.setConfig({ apiKey, server });
}

const CACHE_TTL_MS = (() => {
  const raw = Number(process.env.MAILCHIMP_API_CACHE_SECONDS);
  if (Number.isFinite(raw) && raw > 0) return raw * 1000;
  return 5 * 60 * 1000; // 5 minutes default
})();

interface CacheEntry {
  items: MailchimpNewsletter[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

export async function fetchMailchimpNewsletters(options?: {
  forceRefresh?: boolean;
}): Promise<MailchimpNewsletter[]> {
  configureMailchimp();

  const shouldUseCache =
    !options?.forceRefresh &&
    cache &&
    Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  if (shouldUseCache && cache) {
    return cache.items;
  }

  // Fetch campaigns list via Mailchimp API
  const response = await mailchimp.campaigns.list({
    count: 500,
    offset: 0,
  });

  //@ts-ignore
  const items: MailchimpNewsletter[] = (response.campaigns || []).map(
    (c: any) => mapCampaignToNewsletter(c)
  );

  cache = {
    items,
    fetchedAt: Date.now(),
  };

  return items;
}

export async function getMailchimpNewsletterById(id: string) {
  configureMailchimp();
  const list = cache?.items ?? (await fetchMailchimpNewsletters());
  const base = list.find((i) => i.id === id);
  if (!base) return null;

  // Fetch campaign content on-demand (HTML/plain text)
  try {
    const content = await mailchimp.campaigns.getContent(id);
    return {
      ...base,
      //@ts-ignore
      html_content: content.html ?? base.html_content,
      //@ts-ignore
      contents: content.html ?? base.contents,
      //@ts-ignore
      plain_text: content.plain_text ?? base.plain_text,
    } as MailchimpNewsletter;
  } catch {
    // If content fetch fails, return base metadata
    return base;
  }
}

function mapCampaignToNewsletter(c: any): MailchimpNewsletter {
  const title = c?.settings?.title || c?.settings?.subject_line || "Untitled";
  const createdAt = chooseDate(c?.send_time, c?.create_time);
  const headlineImage = c?.social_card?.image_url as string | undefined;

  return {
    id: c?.id,
    title,
    sub_title: c?.settings?.preview_text || undefined,
    headline_image_url: headlineImage,
    contents: undefined,
    html_content: undefined,
    footer_content: undefined,
    created_at: createdAt,
    link: c?.archive_url || c?.long_archive_url || undefined,
    guid: c?.web_id != null ? String(c.web_id) : undefined,
    author: c?.settings?.from_name || undefined,
    categories: undefined,
    plain_text: undefined,
    source: "mailchimp",
  };
}

function chooseDate(...candidates: (string | undefined)[]): string {
  for (const val of candidates) {
    if (!val) continue;
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

export function getMailchimpErrorInfo(error: any): {
  status?: number;
  detail?: string;
  title?: string;
} {
  const statusRaw = error?.response?.status ?? error?.status;
  const status =
    typeof statusRaw === "number" ? statusRaw : Number(statusRaw) || undefined;
  let parsedText: any;
  const rawText =
    typeof error?.response?.text === "string" ? error.response.text : undefined;
  if (rawText) {
    try {
      parsedText = JSON.parse(rawText);
    } catch {
      parsedText = undefined;
    }
  }
  const detail =
    typeof error?.response?.data?.detail === "string"
      ? error.response.data.detail
      : typeof error?.response?.body?.detail === "string"
        ? error.response.body.detail
        : typeof parsedText?.detail === "string"
          ? parsedText.detail
        : undefined;
  const title =
    typeof error?.response?.data?.title === "string"
      ? error.response.data.title
      : typeof error?.response?.body?.title === "string"
        ? error.response.body.title
        : typeof parsedText?.title === "string"
          ? parsedText.title
        : undefined;
  return { status, detail, title };
}

export function isMailchimpAlreadySubscribed(error: any): boolean {
  const { status, detail } = getMailchimpErrorInfo(error);
  return (
    status === 400 &&
    typeof detail === "string" &&
    detail.toLowerCase().includes("already a list member")
  );
}

export function isMailchimpResubscribeRequired(error: any): boolean {
  const { status, detail, title } = getMailchimpErrorInfo(error);
  if (status !== 400) return false;
  const haystack = `${detail || ""} ${title || ""}`.toLowerCase();
  return (
    haystack.includes("permanently deleted") ||
    haystack.includes("cannot be re-imported") ||
    haystack.includes("re-subscribe") ||
    haystack.includes("resubscribe") ||
    haystack.includes("compliance state") ||
    haystack.includes("forgotten email not subscribed")
  );
}
