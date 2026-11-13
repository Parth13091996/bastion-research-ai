import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { supabase } from "../supabase";
import crypto from "crypto";
import sendEmail, { getResolvedSmtpFromAddress } from "../utils/email";
import {
  sendWelcomeEmail,
  sendWelcomeEmailForUser,
} from "../services/emailNotification.service";
import { validateEmailOtp } from "./otp.controller";
import { incrementCouponUsage } from "./coupon.controller";
import {
  armOnboardingDropOffForUser,
  clearOnboardingDropOffForUser,
  startOnboardingDropOffSession,
} from "../automations/onboardingDropOff.scheduler";
import { syncOnboardedUserToMailchimp } from "../services/mailchimpAudience.service";
type OnboardingUserData = {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  panCard?: string;
  dateOfBirth?: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  company?: string;
  panVerification?: { valid: boolean;[key: string]: any };
  agreementSignatureUrl?: string;
  agreementSignaturePath?: string;
  agreementSignedAt?: string;
  [key: string]: any; // To allow extra props if necessary
};

export const getAccessExpiresIn = (): string => process.env.JWT_ACCESS_EXPIRES_IN || "1d";
export const getRefreshExpiresIn = (): string => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const generateToken = (id: string, email: string, expiresIn: string = getAccessExpiresIn()) => {
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

export const parseDurationToMs = (duration: string, defaultMs: number): number => {
  if (!duration) return defaultMs;
  const match = duration.match(/^(\d+)(s|m|h|d|w)?$/);
  if (!match) return defaultMs;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    case 'w': return val * 7 * 24 * 60 * 60 * 1000;
    default: return val * 1000;
  }
};

export const getRefreshSecret = (): string => {
  const secret =
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : "");
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return secret;
};

export const generateRefreshToken = (
  id: string,
  email: string,
  expiresIn: string = getRefreshExpiresIn()
) => {
  const secret = getRefreshSecret();
  return jwt.sign({ id, email, type: "refresh" }, secret, {
    expiresIn: expiresIn as any,
  });
};

export const getAuthCookieOptions = (maxAgeMs: number = 24 * 60 * 60 * 1000) => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";
  const isSecure =
    process.env.COOKIE_SECURE === "true" ||
    (isProduction && process.env.COOKIE_SECURE !== "false");

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    maxAge: maxAgeMs,
    path: "/",
  };
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password, otp } = req.body as {
    email?: string;
    password?: string;
    otp?: string;
  };

  if (!email || (!password && !otp)) {
    return res
      .status(400)
      .json({ message: "Please provide email and password or email and OTP." });
  }
  const normalizedEmail = normalizeEmail(email);

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", normalizedEmail)
      .single();
    if (error || !user) {
      return res.status(404).json({ message: "User not found." });
    }
    // If OTP provided, validate it; otherwise fallback to password validation
    if (otp) {
      const result = await validateEmailOtp(normalizedEmail, otp);
      if (!result.valid) {
        const reasonToMessage: Record<string, string> = {
          not_found: "No OTP found. Please request one.",
          mismatch: "Invalid OTP.",
          expired: "OTP has expired. Please request a new one.",
          store_error: "Server error while verifying OTP.",
        };
        const status = result.reason === "store_error" ? 500 : 400;
        return res
          .status(status)
          .json({ message: reasonToMessage[result.reason || "mismatch"] });
      }
    } else {
      const isMatch = await bcrypt.compare(password as string, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    }

    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
    const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);
    res.cookie("token", token, getAuthCookieOptions(accessMaxAge));
    res.cookie("refreshToken", refreshToken, getAuthCookieOptions(refreshMaxAge));

    // Fire-and-forget: record a login activity (do not block sign-in)
    try {
      await supabase.from("user_activity").insert({
        user_id: user.id,
        event_type: "login",
        occurred_at: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          null,
        user_agent: (req.headers["user-agent"] as string) || null,
        metadata: null,
      } as any);
    } catch (e) {
      // ignore
    }

    let membershipPlans: any = null;
    if (user.plan_id) {
      try {
        const { data: planData } = await supabase
          .from("membership_plans")
          .select("plan_code, plan_id, plan_name, duration_months, price_amount")
          .eq("plan_id", user.plan_id)
          .maybeSingle();
        if (planData) {
          membershipPlans = planData;
        }
      } catch (e) {
        console.error("Failed to fetch plan for signed in user:", e);
      }
    }

    const { password: _pwd, ...safeUserData } = user;

    res.status(200).json({
      message: "Signed in successfully",
      token,
      refreshToken,
      user: {
        ...safeUserData,
        membership_plans: membershipPlans,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "Server error during sign in." });
  }
};

export const onboardingDropOffStart = async (req: Request, res: Response) => {
  try {
    const { onboarding_session_id, user_id } = req.body as {
      onboarding_session_id?: string;
      user_id?: string;
    };

    const sessionId = startOnboardingDropOffSession(onboarding_session_id);

    if (user_id) {
      armOnboardingDropOffForUser(user_id, sessionId);
    }

    return res.status(200).json({
      message: "Onboarding drop-off tracking started.",
      onboarding_session_id: sessionId,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to start drop-off tracking" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Please provide an email address." });
  }
  const normalizedEmail = normalizeEmail(email);
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .ilike("email", normalizedEmail)
      .single();

    // Always respond success even if not found to prevent user enumeration
    if (!user || error) {
      return res.status(200).json({
        message: "User doesn't exists for this email, Please create one.",
        sentStatus: "failed",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    // password version tag so token invalidates after password change
    const pwdTag = crypto
      .createHash("sha256")
      .update(user.password || "")
      .digest("hex");
    const token = jwt.sign(
      { sub: user.id, email: user.email, type: "pwd_reset", pv: pwdTag },
      secret,
      { expiresIn: "15m" }
    );

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

    const resetSenderEmail = getResolvedSmtpFromAddress();
    if (!resetSenderEmail) {
      return res.status(500).json({
        error:
          "SMTP sender is not configured (set SMTP_USERNAME and matching CONNECT_EMAIL / SMTP_FROM).",
      });
    }
    try {
      await sendEmail({
        to: user.email,
        from: resetSenderEmail,
        subject: "Reset your Bastion Research password",
        text: `We received a request to reset your password.\n\nUse the link below to set a new password. This link expires in 15 minutes.\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `<p>We received a request to reset your password.</p><p>Use the link below to set a new password. This link expires in <strong>15 minutes</strong>.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    } catch (e) {
      // Log but do not expose details
      console.error("Failed to send reset email", e);
    }

    return res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (e) {
    return res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Invalid token or password too short" });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || decoded.type !== "pwd_reset" || !decoded.sub) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("id", decoded.sub)
      .single();
    if (error || !user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Ensure token not reused after password change
    const pwdTag = crypto
      .createHash("sha256")
      .update(user.password || "")
      .digest("hex");
    if (pwdTag !== decoded.pv) {
      return res.status(400).json({ message: "Reset link is no longer valid" });
    }

    const hashed = await bcrypt.hash(password, config.salt_rounds);
    const { error: updError } = await supabase
      .from("users")
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (updError) {
      console.error("Failed to update password", updError);
      return res.status(500).json({ message: "Failed to update password" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (e) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
};

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dateOfBirth,
      address1,
      address2,
      state,
      city,
      pinCode,
      company,
      panCard,
      panVerification,
      status,
      role,
      plan_id,
      onboarding_session_id,
    }: OnboardingUserData = req.body || {};

    const normalizedEmail = email ? normalizeEmail(email) : "";

    // Check if user already exists in database (by email or phone)
    let existingUser: any = null;
    if (normalizedEmail) {
      const { data: userByEmail } = await supabase
        .from("users")
        .select("id, status, username, password, first_name, last_name, phone, pin_code, date_of_birth, address_1, address_2, state, city, company, pan_card_number")
        .ilike("email", normalizedEmail)
        .maybeSingle();
      existingUser = userByEmail;
    }

    if (!existingUser && phone) {
      const cleanPhoneDigits = (phone || "").replace(/\D/g, "");
      const phone10 = cleanPhoneDigits.slice(-10);
      if (phone10.length >= 10) {
        const { data: userByPhone } = await supabase
          .from("users")
          .select("id, status, username, password, first_name, last_name, phone, pin_code, date_of_birth, address_1, address_2, state, city, company, pan_card_number")
          .or(`phone.eq.${phone},phone.ilike.%${phone10},phone.eq.${phone10},phone.eq.+91${phone10}`)
          .limit(1)
          .maybeSingle();
        existingUser = userByPhone;
      }
    }

    const effectiveEmail = normalizedEmail || existingUser?.email;
    const effectivePhone = phone || existingUser?.phone;
    const effectiveFirstName = firstName || existingUser?.first_name;
    const effectiveLastName = lastName || existingUser?.last_name;
    const effectiveDob = dateOfBirth || existingUser?.date_of_birth;
    const rawPin =
      pinCode ??
      (req.body as any)?.pin_code ??
      (req.body as any)?.pincode ??
      existingUser?.pin_code ??
      "";
    const cleanPin = String(rawPin).trim().replace(/\D/g, "");

    // Validate required fields with specific error messages
    if (!effectiveEmail) {
      return res.status(400).json({ message: "Email is required to start onboarding." });
    }
    if (!effectivePhone) {
      return res.status(400).json({ message: "Phone number is required to start onboarding." });
    }
    if (!password && !existingUser?.password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (!effectiveFirstName) {
      return res.status(400).json({ message: "First name is required to start onboarding." });
    }
    if (!effectiveLastName) {
      return res.status(400).json({ message: "Last name is required to start onboarding." });
    }
    if (!effectiveDob) {
      return res.status(400).json({ message: "Date of birth is required to start onboarding." });
    }
    if (!cleanPin) {
      return res.status(400).json({ message: "PIN code is required to start onboarding." });
    }
    if (cleanPin.length !== 6) {
      return res.status(400).json({ message: "PIN code must be a 6-digit number." });
    }

    if (
      (!panVerification || panVerification.valid !== true) &&
      status !== "free" &&
      status !== "pending"
    ) {
      return res
        .status(400)
        .json({ message: "PAN verification is required and must be valid." });
    }

    // Prepare base user fields
    const baseUpdate: any = {
      phone: effectivePhone,
      first_name: effectiveFirstName,
      last_name: effectiveLastName,
      date_of_birth: effectiveDob,
      address_1: address1 || existingUser?.address_1 || "",
      address_2: address2 || existingUser?.address_2 || null,
      state: state || existingUser?.state || "",
      city: city || existingUser?.city || "",
      pin_code: cleanPin,
      company: company || existingUser?.company || null,
      pan_card_number: (panCard || existingUser?.pan_card_number || "").trim().toUpperCase(),
      status,
      pan_verification_metadata: panVerification,
      role: role,
      plan_id,
    };
    let planDetails: { plan_name?: string | null } | null = null;

    // If a plan is attached at onboarding (e.g. free tier),
    // pre-compute subscription start and expiry dates based on plan duration.
    if (plan_id) {
      try {
        const { data: planRow, error: planError } = await supabase
          .from("membership_plans")
          .select("duration_months, plan_name, plan_code, price_amount")
          .eq("plan_id", plan_id as any)
          .maybeSingle();

        if (!planError && planRow) {
          planDetails = planRow as { plan_name?: string | null };
          const isFree =
            planRow.plan_code === "freemium" ||
            planRow.price_amount === 0 ||
            status === "free";

          if (isFree) {
            const start = new Date();
            const startDateStr = start.toISOString().split("T")[0];
            let endDateStr: string | null = null;

            const durationMonths = (planRow as any).duration_months;
            if (typeof durationMonths === "number" && durationMonths > 0) {
              const end = new Date(start);
              end.setMonth(end.getMonth() + durationMonths);
              endDateStr = end.toISOString().split("T")[0];
            }

            baseUpdate.subscription_start_date = startDateStr;
            baseUpdate.subscription_end_date = endDateStr;
            baseUpdate.status = "active";
            baseUpdate.role = role || 'free_subscriber';
          } else {
            // For paid plans, subscription dates and active status MUST NOT be granted before payment
            baseUpdate.subscription_start_date = null;
            baseUpdate.subscription_end_date = null;
            baseUpdate.status = status === "agreement_signed" ? "agreement_signed" : (status || "onboarded");
            baseUpdate.role = role || 'free_subscriber';
          }
        }
      } catch {
        // If membership_plans lookup fails, continue without subscription dates.
      }
    }

    let userId: string | null = null;
    let username: string = "";

    const hashedPassword = password
      ? await bcrypt.hash(password, config.salt_rounds)
      : existingUser?.password;

    // Check if mobile number is already registered with another account
    const cleanPhoneDigits = (phone || "").replace(/\D/g, "");
    const phone10 = cleanPhoneDigits.slice(-10);
    const phoneFilterParts = new Set<string>();
    if (phone && phone.trim()) {
      phoneFilterParts.add(`phone.eq.${phone.trim()}`);
    }
    if (phone10.length >= 10) {
      phoneFilterParts.add(`phone.ilike.%${phone10}`);
      phoneFilterParts.add(`phone.eq.${phone10}`);
      phoneFilterParts.add(`phone.eq.+91${phone10}`);
      phoneFilterParts.add(`phone.eq.91${phone10}`);
    }
    const orFilter = Array.from(phoneFilterParts).join(",");

    if (orFilter) {
      const { data: phoneUser } = await supabase
        .from("users")
        .select("id, email, status")
        .or(orFilter)
        .limit(1)
        .maybeSingle();

      if (phoneUser) {
        if (!existingUser || phoneUser.id !== existingUser.id) {
          return res.status(400).json({
            message:
              "An account with this mobile number already exists. Please log in.",
          });
        }
      }
    }

    if (existingUser) {
      username = (existingUser as any).username || normalizedEmail.split("@")[0];
      // If user is re-attempting or resuming onboarding, update existing record
      if (
        existingUser.status === "onboarded" ||
        existingUser.status === "pending" ||
        !existingUser.status
      ) {
        const { data: updated, error: updError } = await supabase
          .from("users")
          .update({
            phone,
            password: hashedPassword,
            ...baseUpdate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.id)
          .select("id, email")
          .single();

        if (updError) {
          if (
            (updError as any)?.code === "23505" &&
            typeof updError.message === "string"
          ) {
            if (updError.message.includes("users_pan_card_number_key")) {
              return res.status(400).json({
                message: "This PAN is already registered with another account.",
              });
            }
            if (
              updError.message.includes("users_phone_key") ||
              updError.message.includes("phone")
            ) {
              return res.status(400).json({
                message:
                  "An account with this mobile number already exists. Please log in.",
              });
            }
          }
          return res.status(500).json({ message: updError.message });
        }
        userId = updated?.id || existingUser.id;
      } else {
        return res.status(400).json({
          message: "An account with this email already exists. Please log in.",
        });
      }
    } else {
      username =
        normalizedEmail.split("@")[0] +
        `_${Math.random().toString(36).substring(2, 7)}`;
      const { data: inserted, error: insError } = await supabase
        .from("users")
        .insert({
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          username,
          ...baseUpdate,
        })
        .select("id, email")
        .single();
      if (insError) {
        if (
          (insError as any)?.code === "23505" &&
          typeof insError.message === "string"
        ) {
          if (insError.message.includes("users_pan_card_number_key")) {
            return res.status(400).json({
              message: "This PAN is already registered with another account.",
            });
          }
          if (insError.message.includes("users_email_key")) {
            return res.status(400).json({
              message: "An account with this email already exists. Please log in.",
            });
          }
          if (
            insError.message.includes("users_phone_key") ||
            insError.message.includes("phone")
          ) {
            return res.status(400).json({
              message:
                "An account with this mobile number already exists. Please log in.",
            });
          }
        }
        return res.status(500).json({ message: insError.message });
      }
      userId = inserted?.id || null;
    }

    if (userId && status !== "active" && status !== "free") {
      armOnboardingDropOffForUser(userId, onboarding_session_id);
    }

    // Try to persist optional PAN verification metadata if columns exist
    try {
      if (userId) {
        const optionalPayload: Record<string, any> = {};
        if (panVerification?.referenceId)
          optionalPayload.pan_verification_reference =
            panVerification.referenceId;
        if (panVerification?.status)
          optionalPayload.pan_verification_status = panVerification.status;
        if (panVerification?.checkedAt)
          optionalPayload.pan_verified_at = panVerification.checkedAt;

        if (Object.keys(optionalPayload).length > 0) {
          await supabase.from("users").update(optionalPayload).eq("id", userId);
        }
      }
    } catch (e) {
      // ignore schema errors as optional
    }

    const planNameValue = planDetails?.plan_name;
    let welcomePlanName: string | undefined = undefined;
    if (typeof planNameValue === "string") {
      welcomePlanName = planNameValue;
    }
    if (status === "free") {
      void sendWelcomeEmail({
        to: normalizedEmail,
        firstName,
        username,
        planName: welcomePlanName,
      });
      void syncOnboardedUserToMailchimp({
        email: normalizedEmail,
        firstName,
        lastName,
        phone,
        plan: planDetails,
      }).catch((e) => console.error("Mailchimp free onboarding sync failed", e));
    }

    // Issue session cookies so subsequent steps are authenticated
    let token = "";
    let refreshToken = "";
    try {
      token = generateToken(userId as string, normalizedEmail);
      refreshToken = generateRefreshToken(userId as string, normalizedEmail);
      const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
      const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);
      res.cookie("token", token, getAuthCookieOptions(accessMaxAge));
      res.cookie("refreshToken", refreshToken, getAuthCookieOptions(refreshMaxAge));
    } catch { }

    return res.status(200).json({
      message: "Onboarding started. User saved.",
      token,
      refreshToken,
      user: {
        id: userId,
        email: normalizedEmail,
        status: baseUpdate.status || "active",
        role: baseUpdate.role || "free_subscriber",
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to start onboarding" });
  }
};

export const zeroAmountAccountCreation = async (
  req: Request,
  res: Response
) => {
  try {
    const { plan_id, coupon_code, user_id, payer_email } = req.body as {
      plan_id: number;
      coupon_code?: string;
      user_id: string;
      payer_email: string;
    };

    // Fetch coupon (if provided)
    let coupon: any = null;
    if (coupon_code && typeof coupon_code === "string" && coupon_code.trim()) {
      try {
        const { data: couponData, error: couponError } = await supabase
          .from("coupons")
          .select("*")
          .eq("coupon_code", coupon_code.trim().toUpperCase())
          .eq("active", true)
          .maybeSingle();

        if (couponError) {
          return res.status(400).json({ error: couponError.message });
        }

        if (!couponData) {
          return res.status(400).json({ error: "Invalid or inactive coupon" });
        }

        // Check expiry
        if (
          couponData.expiry_date &&
          new Date(couponData.expiry_date) < new Date()
        ) {
          return res.status(400).json({ error: "Coupon has expired" });
        }

        // Respect max_uses / used_count if set
        const maxUses =
          typeof couponData.max_uses === "number"
            ? couponData.max_uses
            : null;
        const usedCount =
          typeof couponData.used_count === "number"
            ? couponData.used_count
            : 0;

        if (maxUses !== null && usedCount >= maxUses) {
          return res
            .status(400)
            .json({ error: "Coupon usage limit reached" });
        }

        coupon = couponData;
      } catch (e: any) {
        return res
          .status(500)
          .json({ error: e?.message || "Error fetching coupon" });
      }
    }

    // Record a zero-amount payment in history so subscription tables stay consistent
    const startDate = new Date();

    try {
      const transactionId = crypto.randomUUID();
      const paymentInsertBase: any = {
        transaction_status: "SUCCESS",
        plan_id: plan_id,
        user_id: user_id,
        payer_email: payer_email,
        transaction_id: transactionId,
        coupon_applied: coupon?.coupon_id,
        coupon_code: coupon?.coupon_code || coupon_code || null,
        discounted_amount: 0,
        created_at: startDate.toISOString(),
      };

      const { error: paymentError } = await supabase
        .from("payment_history")
        .insert(paymentInsertBase)
        .maybeSingle();

      if (paymentError) {
        if (paymentError?.message?.toLowerCase?.().includes("column")) {
          const { error: fallbackError } = await supabase
            .from("payment_history")
            .insert({
              transaction_status: "SUCCESS",
              plan_id: plan_id,
              user_id: user_id,
              payer_email: payer_email,
              transaction_id: transactionId,
              coupon_applied: coupon?.coupon_id,
              created_at: startDate.toISOString(),
            })
            .maybeSingle();
          if (fallbackError) {
            return res.status(500).json({
              error: fallbackError.message || "Error saving payment history",
            });
          }
        } else {
          return res.status(500).json({
            error: paymentError.message || "Error saving payment history",
          });
        }
      }
    } catch (e: any) {
      return res
        .status(500)
        .json({ error: e?.message || "Failed to insert payment history" });
    }

    // Compute subscription window based on plan duration
    let subscriptionStartDate: string | null = null;
    let subscriptionEndDate: string | null = null;
    let roleAfterActivation: string | null = null;
    try {
      const { data: planRow, error: planError } = await supabase
        .from("membership_plans")
        .select("duration_months, plan_code, plan_name, price_amount")
        .eq("plan_id", plan_id as any)
        .maybeSingle();

      if (!planError && planRow) {
        subscriptionStartDate = startDate.toISOString().split("T")[0];
        const durationMonths = (planRow as any).duration_months;
        const planCode = (planRow as any).plan_code;

        if (typeof durationMonths === "number" && durationMonths > 0) {
          const end = new Date(startDate);
          end.setMonth(end.getMonth() + durationMonths);
          subscriptionEndDate = end.toISOString().split("T")[0];
        }

        // Keep role aligned with payment_success webhook behavior.
        // - research_hub -> research_ally_subscriber
        // - freemium -> free_subscriber
        // - everything else -> core_subscriber
        if (planCode === "research_hub") {
          roleAfterActivation = config.roles.research_ally_subscriber;
        } else if (planCode === "freemium") {
          roleAfterActivation = "free_subscriber";
        } else {
          roleAfterActivation = config.roles.core_subscriber;
        }
      }
    } catch (e: any) {
      // If we cannot compute duration, keep dates null; user still gets the plan.
      console.error("Failed to compute subscription dates for zero-amount flow", e);
    }

    try {
      const userUpdate: any = {
        plan_id,
        status: "active",
        role: roleAfterActivation || config.roles.core_subscriber,
        updated_at: new Date().toISOString(),
      };

      if (subscriptionStartDate) {
        userUpdate.subscription_start_date = subscriptionStartDate;
        userUpdate.subscription_end_date = subscriptionEndDate;
      }

      const { data, error } = await supabase
        .from("users")
        .update(userUpdate)
        .eq("id", user_id)
        .select(
          `
          id,
          username,
          first_name,
          last_name,
          phone,
          email,
          address_1,
          pan_card_number,
          address_2,
          state,
          city,
          pin_code,
          date_of_birth,
          company,
          plan_id,
          created_at,
          updated_at,
          status,
          role,
          membership_plans (
            plan_code,
            plan_id
          )
        `
        )
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      clearOnboardingDropOffForUser(user_id);

      // Increment coupon usage after successful application
      if (coupon_code && typeof coupon_code === "string" && coupon_code.trim()) {
        try {
          await incrementCouponUsage(coupon_code.trim());
        } catch (e: any) {
          console.error("Failed to increment coupon usage:", e);
        }
      }

      void sendWelcomeEmailForUser(user_id);
      void syncOnboardedUserToMailchimp({
        email: (data as any)?.email || payer_email,
        firstName: (data as any)?.first_name,
        lastName: (data as any)?.last_name,
        phone: (data as any)?.phone,
        plan: (data as any)?.membership_plans || undefined,
      }).catch((e) => console.error("Mailchimp zero-amount sync failed", e));

      return res.status(200).json({ user: data });
    } catch (e: any) {
      return res
        .status(500)
        .json({ error: e?.message || "Failed to update user" });
    }
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "An unexpected server error occurred" });
  }
};

export const getUserSession = async (req: Request, res: Response) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    let decoded: { id: string; email: string } | null = null;

    if (token && token !== "undefined" && token !== "null") {
      try {
        decoded = jwt.verify(token, secret) as { id: string; email: string };
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          // Access token expired: silent auto-refresh using refreshToken if valid
          const refreshSecret = getRefreshSecret();
          const refreshCandidates = [
            req.cookies?.refreshToken,
            req.headers["x-refresh-token"] as string,
            (req.body as any)?.refreshToken,
          ].filter(
            (t): t is string =>
              typeof t === "string" &&
              t.trim().length > 0 &&
              t !== "undefined" &&
              t !== "null"
          );

          for (const cand of refreshCandidates) {
            try {
              const refreshDecoded = jwt.verify(cand, refreshSecret) as any;
              if (refreshDecoded && refreshDecoded.id) {
                decoded = { id: refreshDecoded.id, email: refreshDecoded.email };
                const newAccessToken = generateToken(refreshDecoded.id, refreshDecoded.email, getAccessExpiresIn());
                const newRefreshToken = generateRefreshToken(refreshDecoded.id, refreshDecoded.email, getRefreshExpiresIn());
                const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
                const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);
                res.cookie("token", newAccessToken, getAuthCookieOptions(accessMaxAge));
                res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(refreshMaxAge));
                res.setHeader("x-access-token", newAccessToken);
                res.setHeader("x-refresh-token", newRefreshToken);
                break;
              }
            } catch {}
          }
        }
      }
    } else {
      // No access token (e.g. expired & cleared by browser), check refresh token candidates
      const refreshSecret = getRefreshSecret();
      const refreshCandidates = [
        req.cookies?.refreshToken,
        req.headers["x-refresh-token"] as string,
      ].filter(
        (t): t is string =>
          typeof t === "string" &&
          t.trim().length > 0 &&
          t !== "undefined" &&
          t !== "null"
      );

      for (const cand of refreshCandidates) {
        try {
          const refreshDecoded = jwt.verify(cand, refreshSecret) as any;
          if (refreshDecoded && refreshDecoded.id) {
            decoded = { id: refreshDecoded.id, email: refreshDecoded.email };
            const newAccessToken = generateToken(refreshDecoded.id, refreshDecoded.email, getAccessExpiresIn());
            const newRefreshToken = generateRefreshToken(refreshDecoded.id, refreshDecoded.email, getRefreshExpiresIn());
            const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
            const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);
            res.cookie("token", newAccessToken, getAuthCookieOptions(accessMaxAge));
            res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(refreshMaxAge));
            res.setHeader("x-access-token", newAccessToken);
            res.setHeader("x-refresh-token", newRefreshToken);
            break;
          }
        } catch {}
      }
    }

    if (!decoded) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let userResult = await supabase
      .from("users")
      .select(
        `
          id,
          username,
          first_name,
          last_name,
          phone,
          email,
          address_1,
          pan_card_number,
          address_2,
          state,
          city,
          pin_code,
          date_of_birth,
          company,
          plan_id,
          subscription_start_date,
          subscription_end_date,
          membership_plans (
            plan_code,
            plan_id,
            plan_name,
            duration_months,
            price_amount     
          ),
          created_at,
          updated_at,
          status,
          role,
          digio_documents(document_id)
        `
      )
      .eq("id", decoded.id)
      .maybeSingle();

    let user = userResult.data;
    if (userResult.error || !user) {
      if (userResult.error) {
        console.warn(
          "getUserSession primary query error, trying safe fallback:",
          userResult.error.message
        );
      }
      const { data: baseUser, error: baseError } = await supabase
        .from("users")
        .select("*")
        .eq("id", decoded.id)
        .maybeSingle();

      if (baseError || !baseUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _pwd, ...safeBaseUser } = baseUser;

      let membershipPlan = null;
      if (safeBaseUser.plan_id) {
        try {
          const { data: planData } = await supabase
            .from("membership_plans")
            .select("plan_code, plan_id, plan_name, duration_months, price_amount")
            .eq("plan_id", safeBaseUser.plan_id)
            .maybeSingle();
          membershipPlan = planData || null;
        } catch {
          // ignore
        }
      }

      let digioDocs: any[] = [];
      try {
        const { data: docs } = await supabase
          .from("digio_documents")
          .select("document_id")
          .eq("user_id", safeBaseUser.id);
        digioDocs = docs || [];
      } catch {
        // ignore
      }

      user = {
        ...safeBaseUser,
        membership_plans: membershipPlan,
        digio_documents: digioDocs,
      };
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("getUserSession error:", error);
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    ...getAuthCookieOptions(0),
    expires: new Date(0),
    maxAge: 0,
  });
  res.cookie("refreshToken", "", {
    ...getAuthCookieOptions(0),
    expires: new Date(0),
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const rawRefreshTokenCandidates = [
      req.body?.refreshToken,
      req.cookies?.refreshToken,
      req.headers["x-refresh-token"] as string,
    ].filter(
      (t): t is string =>
        typeof t === "string" &&
        t.trim().length > 0 &&
        t !== "undefined" &&
        t !== "null"
    );

    if (rawRefreshTokenCandidates.length === 0) {
      console.warn("[refreshToken] No refresh token provided in body, cookies, or headers");
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const refreshSecret = getRefreshSecret();
    let decoded: any = null;
    let lastError: any = null;

    for (const tokenCandidate of rawRefreshTokenCandidates) {
      try {
        const result = jwt.verify(tokenCandidate, refreshSecret) as any;
        if (result && result.id && (result.type === "refresh" || !result.type)) {
          decoded = result;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!decoded) {
      console.warn("[refreshToken] Refresh token verification failed:", lastError?.message);
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        error: lastError?.name || "Unauthorized",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, status, role, username")
      .eq("id", decoded.id)
      .maybeSingle();

    if (error || !user) {
      console.warn("[refreshToken] User not found for id:", decoded.id);
      return res.status(401).json({ message: "User not found or session expired" });
    }

    const newAccessToken = generateToken(user.id, user.email, getAccessExpiresIn());
    const newRefreshToken = generateRefreshToken(user.id, user.email, getRefreshExpiresIn());

    const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
    const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);
    res.cookie("token", newAccessToken, getAuthCookieOptions(accessMaxAge));
    res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(refreshMaxAge));
    res.setHeader("x-access-token", newAccessToken);
    res.setHeader("x-refresh-token", newRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error: any) {
    console.error("[refreshToken] Unexpected error:", error);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};
