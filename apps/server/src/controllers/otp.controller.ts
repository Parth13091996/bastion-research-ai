import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import twilio from "twilio";

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !twilioFromNumber) {
  console.error("Twilio credentials are not set in the environment variables.");
}

const twilioClient = twilio(accountSid, authToken);

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required." });
  }

  if (!twilioClient) {
    return res
      .status(500)
      .json({ message: "Twilio client is not configured." });
  }

  try {
    // 1. Find the onboarding session
    const { data: session, error: sessionError } = await supabase
      .from("onboarding_sessions")
      .select("session_data")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ message: "Onboarding session not found." });
    }

    const phone = session.session_data?.phone;
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone number not found in session data." });
    }

    // 2. Generate OTP and expiration
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Save OTP to the session's record
    const updated_session_data = {
      ...session.session_data,
      otp,
      otp_expires_at: otp_expires_at.toISOString(),
    };
    const { error: updateError } = await supabase
      .from("onboarding_sessions")
      .update({ session_data: updated_session_data })
      .eq("id", sessionId);

    if (updateError) {
      console.error("OTP update error:", updateError);
      return res
        .status(500)
        .json({ message: "Failed to save OTP to session." });
    }

    // 4. Send the OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: twilioFromNumber,
        to: phone,
      });
      res.status(200).json({ message: "OTP sent successfully." });
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
  const { sessionId, otp } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({ message: "sessionId and OTP are required." });
  }

  try {
    // 1. Find the session and its stored OTP
    const { data: session, error: sessionError } = await supabase
      .from("onboarding_sessions")
      .select("session_data")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ message: "Onboarding session not found." });
    }

    const { otp: storedOtp, otp_expires_at: storedOtpExpiresAt } =
      session.session_data;

    // 2. Verify the OTP
    if (!storedOtp || !storedOtpExpiresAt) {
      return res
        .status(400)
        .json({
          message: "No OTP found for this session. Please request one.",
        });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (new Date() > new Date(storedOtpExpiresAt)) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // 3. Clear the OTP from the session data and update status
    const {
      otp: _otp,
      otp_expires_at: _otp_expires_at,
      ...restOfSessionData
    } = session.session_data;
    const { error: updateError } = await supabase
      .from("onboarding_sessions")
      .update({ session_data: restOfSessionData, status: "otp_verified" })
      .eq("id", sessionId);

    if (updateError) {
      console.error("OTP clear error:", updateError);
      // Don't block the user, but log the error
    }

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error while verifying OTP." });
  }
};
