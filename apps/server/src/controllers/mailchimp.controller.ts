import { Request, Response } from "express";
import mailchimp from "@mailchimp/mailchimp_marketing";
import {
  fetchMailchimpNewsletters,
  getMailchimpNewsletterById,
} from "../services/mailchimp.service";

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function listMailchimpNewsletters(req: Request, res: Response) {
  try {
    const force = req.query.force === "true";
    const data = await fetchMailchimpNewsletters({
      forceRefresh: force,
    });
    return res.status(200).json(data ?? []);
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
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function subscribeToNewsLetter(req: Request, res: Response) {
  try {
    const { email, latitude, longitude, timestamp } = req.body;

    // Basic validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }

    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      {
        email_address: email,
        status: "subscribed",
        location: {
          latitude,
          longitude,
        },
        timestamp_signup: timestamp,
      },
      {
        skipMergeValidation: true,
      }
    );
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
