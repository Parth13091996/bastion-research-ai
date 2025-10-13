import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../utils/config";

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !twilioFromNumber) {
  console.error("Twilio credentials are not set in the environment variables.");
}

const twilioClient = twilio(accountSid, authToken);

// In-memory OTP store keyed by phone number
// Note: For production, prefer a persistent store (e.g., Redis) or Twilio Verify
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    // 1. Generate OTP and expiration
    const otp = generateOtp();
    const expiresAt = Date.now() + config.otp_ttl_ms;

    // 2. Save OTP in-memory store for the phone
    otpStore.set(phone, { otp, expiresAt });

    // 3. Send the OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: twilioFromNumber,
        to: phone,
      });
      res.status(200).json({ message: "OTP sent successfully.", expiresAt });
    } catch (twilioError) {
      console.error("Twilio sending error:", twilioError);
      res.status(500).json({ message: "Failed to send OTP." });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body as { phone?: string; otp?: string };

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

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error while verifying OTP." });
  }
};
