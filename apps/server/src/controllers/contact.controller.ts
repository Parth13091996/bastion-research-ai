import { Request, Response } from "express";
import sendEmail, { getResolvedSmtpFromAddress } from "../utils/email";
import { config } from "../utils/config";
import { supabase } from "../supabase";

const COMMON_TLD_TYPOS: Record<string, string> = {
  con: "com",
  cmo: "com",
  comm: "com",
  coom: "com",
  ocm: "com",
  cpm: "com",
  vom: "com",
  xom: "com",
  nett: "net",
  orgg: "org",
  innd: "in",
};

const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}$/;

export const validateContactEmail = (email?: string): string | null => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return "Please enter your email.";
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return "Email address is too long.";
  }

  if (trimmed.includes("..")) {
    return "Email address cannot contain consecutive dots.";
  }

  if (trimmed.includes("@.")) {
    return "Domain name cannot start with a dot.";
  }

  if (trimmed.includes(".@")) {
    return "Local part of email cannot end with a dot.";
  }

  if (trimmed.startsWith(".")) {
    return "Email cannot start with a dot.";
  }

  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address with a proper domain (e.g. name@example.com).";
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return "Please enter a valid email address.";
  }

  const domain = parts[1];
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (COMMON_TLD_TYPOS[tld]) {
    return `Did you mean .${COMMON_TLD_TYPOS[tld]} instead of .${tld}? Please check your email domain.`;
  }

  return null;
};

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, category, message } = req.body || {};

    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .json({ message: "Name is required" });
    }

    if (!email || !String(email).trim()) {
      return res
        .status(400)
        .json({ message: "Email is required" });
    }

    const emailErr = validateContactEmail(String(email));
    if (emailErr) {
      return res.status(400).json({
        message: emailErr,
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const safe = (v: any) => (v ? String(v) : "-");

    const subject = `[Contact Leads] ${safe(category)} - ${safe(name)}`;
    const text = `New contact submission\n\nName: ${safe(name)}\nEmail: ${safe(email)}\nPhone: ${safe(phone)}\nCategory: ${safe(category)}\n\nMessage:\n${safe(message)}\n`;

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
              <p style="margin: 0 0 4px 0;">This message was sent from the <a href="${config.app_url}" style="color: #1a73e8; text-decoration: none;">Bastion Research</a> website.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Bastion Research. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    // Save lead into database (best-effort; do not fail request if email sending succeeds)
    try {
      await supabase.from("leads").insert({
        name,
        email,
        phone,
        category,
        message,
        status: "new",
      });
    } catch (e) {
      // non-fatal
      console.error("Failed to store lead:", e);
    }

    const toInbox = process.env.LEADS_EMAIL?.trim();
    const fromAddress = getResolvedSmtpFromAddress();
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USERNAME?.trim();
    const smtpPass = process.env.SMTP_PASSWORD?.trim();

    if (!toInbox || !fromAddress || !smtpHost || !smtpUser || !smtpPass) {
      console.warn(
        "Contact form: Lead stored in database, but SMTP is not fully configured (SMTP_HOST/USERNAME/PASSWORD). Skipping email delivery."
      );
      return res.status(200).json({
        message: "Message received! We will get back to you shortly.",
      });
    }

    try {
      await sendEmail({
        to: toInbox,
        from: fromAddress,
        subject,
        text,
        html,
      });
    } catch (emailErr) {
      console.error("Contact form: Failed to send notification email via SMTP:", emailErr);
    }

    return res.status(200).json({ message: "Message sent" });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "Failed to send message" });
  }
};
