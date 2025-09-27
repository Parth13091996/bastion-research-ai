import Parser from "rss-parser";

type RawMailchimpItem = Parser.Item & {
  isoDate?: string;
  "content:encoded"?: string;
  contentEncoded?: string;
  author?: string;
  creator?: string;
};

export interface MailchimpNewsletter {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  contents?: string;
  html_content?: string;
  footer_content?: string;
  created_at: string;
  link?: string;
  guid?: string;
  author?: string;
  categories?: string[];
  plain_text?: string;
  source?: "mailchimp";
}

const MAILCHIMP_RSS_URL = process.env.MAILCHIMP_RSS_URL;
const CACHE_TTL_MS = (() => {
  const raw = Number(process.env.MAILCHIMP_RSS_CACHE_SECONDS);
  if (Number.isFinite(raw) && raw > 0) return raw * 1000;
  return 5 * 60 * 1000; // 5 minutes default
})();

const parser = new Parser<{ items: RawMailchimpItem[] }>({
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

interface CacheEntry {
  items: MailchimpNewsletter[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

export async function fetchMailchimpNewsletters(options?: {
  forceRefresh?: boolean;
}): Promise<MailchimpNewsletter[]> {
  if (!MAILCHIMP_RSS_URL) {
    throw new Error(
      "MAILCHIMP_RSS_URL is not configured in environment variables"
    );
  }

  const shouldUseCache =
    !options?.forceRefresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  if (shouldUseCache && cache) {
    return cache.items;
  }

  const feed = await parser.parseURL(MAILCHIMP_RSS_URL);

  const items = (feed.items || []).map((item) => mapMailchimpItem(item));

  cache = {
    items,
    fetchedAt: Date.now(),
  };

  return items;
}

export async function getMailchimpNewsletterById(id: string) {
  const items = await fetchMailchimpNewsletters();
  return items.find((item) => item.id === id) ?? null;
}

function mapMailchimpItem(item: RawMailchimpItem): MailchimpNewsletter {
  const guidSource =
    item.guid || item.link || `${item.title ?? "unknown"}-${item.pubDate ?? Date.now()}`;
  const id = encodeIdentifier(guidSource);

  const rawHtml =
    item.contentEncoded ?? item["content:encoded"] ?? item.content ?? "";
  const headline_image_url = extractFirstImage(rawHtml);
  const sub_title = buildSubtitle(item, rawHtml);
  const created_at = parseDate(item.isoDate ?? item.pubDate);

  return {
    id,
    title: item.title ?? "Untitled Newsletter",
    sub_title,
    headline_image_url,
    contents: rawHtml,
    html_content: rawHtml,
    footer_content: undefined,
    created_at,
    link: item.link,
    guid: item.guid ?? undefined,
    author: item.creator ?? item.author ?? undefined,
    categories: item.categories ?? undefined,
    plain_text: buildPlainText(rawHtml ?? ""),
    source: "mailchimp",
  };
}

function encodeIdentifier(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function parseDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/i);
  return match ? match[1] : undefined;
}

function buildSubtitle(item: RawMailchimpItem, html: string): string | undefined {
  if (item.contentSnippet) {
    return truncate(item.contentSnippet.trim(), 180);
  }
  const plain = buildPlainText(html);
  if (!plain) return undefined;
  return truncate(plain, 180);
}

function buildPlainText(html: string): string {
  if (!html) return "";
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  return collapseWhitespace(withoutTags).trim();
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}
