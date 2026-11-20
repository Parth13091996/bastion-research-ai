import { Request, Response } from "express";
import twilio from "twilio";
import bcryptjs from "bcryptjs";
import { config } from "../utils/config";
import sendEmail, { getResolvedSmtpFromAddress } from "../utils/email";
import { supabase } from "../supabase";
import jwt from "jsonwebtoken";
import { saveOtp, validateOtp } from "../services/otpStore.service";
import { generateRefreshToken, getAuthCookieOptions, parseDurationToMs } from "./auth.controller";

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !twilioFromNumber) {
  console.error("Twilio credentials are not set in the environment variables.");
}

const twilioClient =
  accountSid && authToken && twilioFromNumber
    ? twilio(accountSid, authToken)
    : null;

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (id: string, email: string, expiresIn: string = process.env.JWT_ACCESS_EXPIRES_IN || "1d") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, email }, secret, { expiresIn: expiresIn as any });
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// const getAuthCookieOptions = () => ({
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite:
//     process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
//   maxAge: 24 * 60 * 60 * 1000,
// });



const normalizePhone = (input?: string): string => {
  const raw = (input || "").trim().replace(/\s+/g, "");
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length > 10 && !raw.startsWith("+")) return `+${digits}`;
  return raw;
};

export const sendOtp = async (req: Request, res: Response) => {
  const { phone: rawPhone, email: rawEmail } = req.body as {
    phone?: string;
    email?: string;
  };

  if (!rawPhone) {
    return res.status(400).json({ message: "phone is required." });
  }

  const phone = normalizePhone(rawPhone);

  if (!twilioClient) {
    return res
      .status(500)
      .json({ message: "Twilio client is not configured." });
  }

  try {
    // Check if an account with this email already exists before sending OTP
    if (rawEmail && typeof rawEmail === "string" && rawEmail.trim()) {
      const normalizedEmail = normalizeEmail(rawEmail);
      const { data: existingEmailUser, error: emailError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (emailError) throw emailError;

      if (existingEmailUser) {
        return res.status(409).json({
          message: "Email already registered. Please login.",
        });
      }
    }
    // Check if an active account with this phone number already exists
    const cleanDigits = phone.replace(/\D/g, "");
    const phone10 = cleanDigits.slice(-10);
    if (phone10.length >= 10) {
      const { data: existingPhoneUser } = await supabase
        .from("users")
        .select("id, status")
        .or(`phone.eq.${phone},phone.ilike.%${phone10},phone.eq.${phone10},phone.eq.+91${phone10}`)
        .limit(1)
        .maybeSingle();

      if (
        existingPhoneUser &&
        existingPhoneUser.status !== "onboarded" &&
        existingPhoneUser.status !== "pending" &&
        existingPhoneUser.status !== null
      ) {
        return res.status(400).json({
          message:
            "An account with this mobile number already exists. Please log in.",
        });
      }
    }

    // Check if an OTP was recently dispatched in the last 30 seconds (enforces 30s cooldown)
    const { data: existingEntry } = await supabase
      .from("otp_codes")
      .select("updated_at, expires_at, consumed_at")
      .eq("identifier", phone)
      .eq("type", "phone")
      .maybeSingle();

    if (existingEntry && existingEntry.updated_at) {
      const msSinceLast = Date.now() - new Date(existingEntry.updated_at).getTime();
      const COOLDOWN_MS = 30000;
      if (msSinceLast < COOLDOWN_MS) {
        const remainingSeconds = Math.max(1, Math.ceil((COOLDOWN_MS - msSinceLast) / 1000));
        console.log(`[sendOtp] Cooldown active for ${phone} (${msSinceLast}ms ago, ${remainingSeconds}s remaining)`);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"} before requesting otp again.`,
          remainingSeconds,
          cooldown: remainingSeconds,
        });
      }
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + config.otp_ttl_ms;
    await saveOtp({ identifier: phone, type: "phone", otp, expiresAt });
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

    // Check 30-second cooldown for email OTP
    const { data: existingOtp } = await supabase
      .from("otp_codes")
      .select("updated_at, expires_at")
      .eq("identifier", normalizedEmail)
      .eq("type", "email")
      .maybeSingle();

    if (existingOtp && existingOtp.updated_at) {
      const msSinceLast = Date.now() - new Date(existingOtp.updated_at).getTime();
      const COOLDOWN_MS = 30000;
      if (msSinceLast < COOLDOWN_MS) {
        const remainingSeconds = Math.max(1, Math.ceil((COOLDOWN_MS - msSinceLast) / 1000));
        console.log(`[sendEmailOtp] Cooldown active for ${normalizedEmail} (${msSinceLast}ms ago, ${remainingSeconds}s remaining)`);
        return res.status(429).json({
          message: `An OTP was already sent to this email. Please wait ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"} before requesting again.`,
          remainingSeconds,
          cooldown: remainingSeconds,
        });
      }
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + config.otp_ttl_ms;
    await saveOtp({
      identifier: normalizedEmail,
      type: "email",
      otp,
      expiresAt,
    });

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

    await sendEmail({
      to: normalizedEmail,
      from: fromEmail,
      subject,
      text,
      html,
    });
    return res
      .status(200)
      .json({ message: "OTP sent successfully.", expiresAt });
  } catch (error) {
    console.error("Email OTP send error:", error);
    return res.status(500).json({ message: error });
  }
};

// export const verifyOtp = async (req: Request, res: Response) => {
//   const { phone: rawPhone, otp } = req.body as {
//     phone?: string;
//     otp?: string;
//     email?: string;
//   };

//   if (!rawPhone || !otp) {
//     return res.status(400).json({ message: "phone and otp are required." });
//   }

//   const phone = normalizePhone(rawPhone);

//   try {
//     const result = await validateOtp(phone, "phone", otp);

//     if (!result.valid) {
//       const reasonToMessage: Record<string, string> = {
//         not_found: "No OTP found. Please request one.",
//         mismatch: "Invalid OTP.",
//         expired: "OTP has expired. Please request a new one.",
//         store_error: "Server error while verifying OTP.",
//       };
//       const status = result.reason === "store_error" ? 500 : 400;
//       return res
//         .status(status)
//         .json({ message: reasonToMessage[result.reason || "mismatch"] });
//     }

//     return res.status(200).json({
//       message: "OTP verified successfully.",
//     });
//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while verifying OTP." });
//   }
// };


export const verifyOtp = async (req: Request, res: Response) => {
  const { phone: rawPhone, otp, email, password } = req.body as {
    phone?: string;
    otp?: string;
    email?: string;
    password?: string;
  };

  if (!rawPhone || !otp || !email || !password) {
    return res.status(400).json({
      message: "Phone, OTP, email and password are required.",
    });
  }

  const phone = normalizePhone(rawPhone);
  const normalizedEmail = normalizeEmail(email);

  try {
    // 1. Verify OTP
    const result = await validateOtp(phone, "phone", otp);

    if (!result.valid) {
      const reasonToMessage: Record<string, string> = {
        not_found: "No OTP found. Please request one.",
        mismatch: "Invalid OTP.",
        expired: "OTP has expired. Please request a new one.",
        store_error: "Server error while verifying OTP.",
      };

      return res
        .status(result.reason === "store_error" ? 500 : 400)
        .json({
          message: reasonToMessage[result.reason || "mismatch"],
        });
    }

    // 2. Check existing email
    const { data: existingEmail, error: emailError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (emailError) throw emailError;

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered. Please login.",
      });
    }

    // 3. Check existing phone
    const cleanPhone = phone.replace(/\D/g, "");
    const phone10 = cleanPhone.slice(-10);

    const { data: existingPhone, error: phoneError } = await supabase
      .from("users")
      .select("id")
      .or(
        `phone.eq.${phone},phone.eq.${phone10},phone.eq.+91${phone10},phone.eq.91${phone10}`
      )
      .limit(1)
      .maybeSingle();

    if (phoneError) throw phoneError;

    if (existingPhone) {
      return res.status(409).json({
        message: "Phone number already registered. Please login.",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcryptjs.hash(
      password,
      config.salt_rounds
    );

    // 5. Generate username
    const username =
      normalizedEmail.split("@")[0] +
      `_${Math.random().toString(36).substring(2, 7)}`;

    // 6. Create user
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        username,
        first_name: "",
        last_name: "",
        pan_card_number: "",
        address_1: "",
        address_2: null,
        state: "",
        city: "",
        pin_code: "",
        company: "",
        role: "free_subscriber",
        // Optional date field
        date_of_birth: "1970-01-01",

        // Optional JSONB field
        pan_verification_metadata: null,

        // Optional plan reference
        plan_id: null,
        status: "pending",
      })
      .select("id, email, phone, username, status")
      .single();

    if (insertError) throw insertError;

    // 7. Generate authentication and refresh tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const accessMaxAge = parseDurationToMs(process.env.JWT_ACCESS_EXPIRES_IN || "1d", 24 * 60 * 60 * 1000);
    const refreshMaxAge = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d", 7 * 24 * 60 * 60 * 1000);
    res.cookie("token", token, getAuthCookieOptions(accessMaxAge));
    res.cookie("refreshToken", refreshToken, getAuthCookieOptions(refreshMaxAge));
    res.setHeader("x-access-token", token);
    res.setHeader("x-refresh-token", refreshToken);

    return res.status(201).json({
      message: "OTP verified and account created successfully.",
      user,
      token,
      refreshToken,
    });

  } catch (error: any) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: "Server error while creating user.",
    });
  }
};

export const validateEmailOtp = (key: string, otp: string) =>
  validateOtp(key, "email", otp);
