import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../utils/config";
import sendEmail, { getResolvedSmtpFromAddress } from "../utils/email";
import { supabase } from "../supabase";

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !twilioFromNumber) {
  console.error("Twilio credentials are not set in the environment variables.");
}

const twilioClient = twilio(accountSid, authToken);

// In-memory OTP store keyed by identifier (phone number or email)
// Note: For production, prefer a persistent store (e.g., Redis) or Twilio Verify
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body as { phone?: string };

  if (!phone) {
    return res.status(400).json({ message: "phone is required." });
  }

  if (!twilioClient) {
    return res
      .status(500)
      .json({ message: "Twilio client is not configured." });
  }

  try {
    const otp = generateOtp();
    const expiresAt = Date.now() + config.otp_ttl_ms;
    otpStore.set(phone, { otp, expiresAt });
    try {
      await twilioClient.messages.create({
        body: `Bastion Research Onboarding: Your verification code is: ${otp}`,
        from: twilioFromNumber,
        to: phone,
      });
      return res
        .status(200)
        .json({ message: "OTP sent successfully.", expiresAt });
    } catch (twilioError) {
      console.error("Twilio sending error:", twilioError);
      return res.status(500).json({ message: "Failed to send OTP." });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Server error while sending OTP." });
  }
};

export const sendEmailOtp = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: "email is required." });
  }
  const normalizedEmail = normalizeEmail(email);

  try {
    // Check if the email exists in the users table
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Supabase error while checking email existence:", error);
      return res
        .status(500)
        .json({ message: "Server error while verifying user." });
    }

    if (!user) {
      return res.status(400).json({ message: "This email is not registered." });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + config.otp_ttl_ms;
    otpStore.set(normalizedEmail, { otp, expiresAt });

    const fromEmail = getResolvedSmtpFromAddress();
    if (!fromEmail) {
      return res.status(500).json({
        message:
          "Sender email is not configured (set LEADS_EMAIL or SMTP_USERNAME).",
      });
    }

    const minutes = Math.floor(config.otp_ttl_ms / 60000);
    const subject = "Your Bastion Login Code";
    const text = `Your login verification code is: ${otp}. It expires in ${minutes} minutes.`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f9; padding: 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding: 32px 32px 16px 32px; border-bottom: 1px solid #eaeaea;">
              <img src="${config.app_url}/media/header-logo.webp" alt="Bastion Research" style="height: 40px; display: block; margin-bottom: 16px;">
              <h2 style="margin: 0 0 8px 0; color: #222;">Your Login Verification Code</h2>
              <p style="margin: 0; color: #666; font-size: 15px;">Use the following code to sign in. This code will expire in ${minutes} minute${minutes === 1 ? "" : "s"}.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px;">
              <div style="text-align: center;">
                <div style="display: inline-block; padding: 16px 24px; background: #f5f6fa; border-radius: 8px; letter-spacing: 6px; font-size: 28px; font-weight: 700; color: #222;">${otp}</div>
              </div>
              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px;">If you did not request this code, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 24px 32px; color: #888; font-size: 13px; border-top: 1px solid #eaeaea;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Bastion Research. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await sendEmail({ to: normalizedEmail, from: fromEmail, subject, text, html });
    return res
      .status(200)
      .json({ message: "OTP sent successfully.", expiresAt });
  } catch (error) {
    console.error("Email OTP send error:", error);
    return res.status(500).json({ message: error });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body as {
    phone?: string;
    otp?: string;
    email?: string;
  };

  if (!phone || !otp) {
    return res.status(400).json({ message: "phone and otp are required." });
  }

  try {
    const entry = otpStore.get(phone);

    if (!entry) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please request one." });
    }

    const { otp: storedOtp, expiresAt } = entry;

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (Date.now() > expiresAt) {
      otpStore.delete(phone);
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // 3. Clear OTP for this phone after successful verification
    otpStore.delete(phone);

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res
      .status(500)
      .json({ message: "Server error while verifying OTP." });
  }
};

export const validateEmailOtp = (
  key: string,
  otp: string
): {
  valid: boolean;
  reason?: string;
} => {
  const entry = otpStore.get(key);
  if (!entry) return { valid: false, reason: "not_found" };
  const { otp: storedOtp, expiresAt } = entry;
  if (storedOtp !== otp) return { valid: false, reason: "mismatch" };
  if (Date.now() > expiresAt) {
    otpStore.delete(key);
    return { valid: false, reason: "expired" };
  }
  otpStore.delete(key);
  return { valid: true };
};
