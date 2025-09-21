import { Request, Response } from "express";
import sendEmail from "../utils/email";
import { supabase } from "../supabase";
import { config } from "../utils/config";

const CONTACT_EMAIL_KEY = "contact_recipient_email";

const getRecipient = async (): Promise<string> => {
  const fallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_DEFAULT_TO || "connect@bastionresearch.in";
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", CONTACT_EMAIL_KEY)
      .maybeSingle();
    return data?.value || fallback;
  } catch {
    return fallback;
  }
};

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, category, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ message: "name, email and message are required" });
    }

    const to = await getRecipient();

    const safe = (v: any) => (v ? String(v) : "-");

    const subject = `[Contact] ${safe(category)} - ${safe(name)}`;
    const text = `New contact submission\n\nName: ${safe(name)}\nEmail: ${safe(email)}\nPhone: ${safe(phone)}\nCategory: ${safe(category)}\n\nMessage:\n${safe(message)}\n`;

    // Professional HTML email template
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f9; padding: 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding: 32px 32px 16px 32px; border-bottom: 1px solid #eaeaea;">
              <img src="${config.app_url}/media/header-logo.webp" alt="Bastion Research" style="height: 40px; display: block; margin-bottom: 16px;">
              <h2 style="margin: 0 0 8px 0; color: #222;">New Contact Submission</h2>
              <p style="margin: 0; color: #666; font-size: 15px;">You have received a new message from the Bastion Research website contact form.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #222;">
                <tr>
                  <td style="padding: 8px 0; width: 120px; color: #888;">Name:</td>
                  <td style="padding: 8px 0;"><strong>${safe(name)}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${safe(email)}" style="color: #1a73e8;">${safe(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">Phone:</td>
                  <td style="padding: 8px 0;">${safe(phone)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">Category:</td>
                  <td style="padding: 8px 0;">${safe(category)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; vertical-align: top;">Message:</td>
                  <td style="padding: 8px 0; background: #f5f6fa; border-radius: 4px;">
                    <div style="white-space: pre-line; color: #222;">${String(safe(message)).replace(/\n/g, "<br/>")}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 24px 32px; color: #888; font-size: 13px; border-top: 1px solid #eaeaea;">
              <p style="margin: 0 0 4px 0;">This message was sent from the <a href="https://bastionresearch.in" style="color: #1a73e8; text-decoration: none;">Bastion Research</a> website.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Bastion Research. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await sendEmail({ to, subject, text, html });

    return res.status(200).json({ message: "Message sent" });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to send message" });
  }
};
