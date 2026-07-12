import axios from "axios";
import { config } from "../utils/config";

export type AiSensyCampaignPayload = {
  destination: string;
  userName: string;
  /** Overrides env AISENSY_CAMPAIGN_NAME when set. */
  campaignName?: string;
  source?: string;
  templateParams?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
  media?: {
    url: string;
    filename: string;
  };
};

function normalizeDestinationPhone(input: string) {
  // AiSensy accepts numbers with or without country code. We just remove obvious formatting.
  return (input || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-().]/g, "");
}

export async function sendAiSensyCampaign(payload: AiSensyCampaignPayload) {
  const apiKey = process.env.AISENSY_API_KEY;
  const campaignName =
    (payload.campaignName || "").trim() || process.env.AISENSY_CAMPAIGN_NAME;

  if (!apiKey || !campaignName) {
    return { sent: false, skipped: true, reason: "missing_env" as const };
  }

  const destination = normalizeDestinationPhone(payload.destination);
  const userName = (payload.userName || "").trim();

  if (!destination || !userName) {
    return { sent: false, skipped: true, reason: "invalid_payload" as const };
  }

  try {
    const { data } = await axios.post(
      config.aisensy_endpoint,
      {
        apiKey,
        campaignName,
        destination, 
        userName: "Bastion Research",
        source: payload.source,
        templateParams: payload.templateParams && payload.templateParams.length > 0
          ? [...payload.templateParams, "N/A", "N/A"]
          : [],
        tags: payload.tags,
        attributes: payload.attributes,
        media: payload.media || {},
        buttons: [],
        carouselCards: [],
        location: {},
        paramsFallbackValue: {
          FirstName: "user",
        },
      },
      {
        timeout: 10_000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return { sent: true, skipped: false, data };
  } catch (error: any) {
    console.error("AiSensy API call failed:", error?.message || error);
    return {
      sent: false,
      skipped: false,
      error: error?.message || "AiSensy API call failed",
      details: error?.response?.data || undefined,
    };
  }
}
