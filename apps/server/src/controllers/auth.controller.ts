import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { supabase } from "../supabase";
import crypto from "crypto";
import sendEmail from "../utils/email";
import { validateEmailOtp } from "./otp.controller";
import { incrementCouponUsage } from "./coupon.controller";
type OnboardingUserData = {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  panCard: string;
  dateOfBirth: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  company?: string;
  panVerification: { valid: boolean; [key: string]: any };
  agreementSignatureUrl: string;
  agreementSignaturePath?: string;
  agreementSignedAt?: string;
  [key: string]: any; // To allow extra props if necessary
};

const generateToken = (id: string, email: string, expiresIn: string = "1d") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, email }, secret, { expiresIn: expiresIn as any });
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

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !user) {
      return res.status(404).json({ message: "User not found." });
    }
    // If OTP provided, validate it; otherwise fallback to password validation
    if (otp) {
      const result = validateEmailOtp(email, otp);
      if (!result.valid) {
        const reasonToMessage: Record<string, string> = {
          not_found: "No OTP found. Please request one.",
          mismatch: "Invalid OTP.",
          expired: "OTP has expired. Please request a new one.",
        };
        return res
          .status(400)
          .json({ message: reasonToMessage[result.reason || "mismatch"] });
      }
    } else {
      const isMatch = await bcrypt.compare(password as string, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    }

    const token = generateToken(user.id, user.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "strict", // Or 'lax'
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

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

    res.status(200).json({
      message: "Signed in successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "Server error during sign in." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Please provide an email address." });
  }
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("email", email)
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

    const resetSenderEmail = process.env.CONNECT_EMAIL;
    if (!resetSenderEmail) {
      return res
        .status(500)
        .json({ error: "Welcome Sender email is missing from backend/envs." });
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
    }: OnboardingUserData = req.body || {};

    if (
      !email ||
      !phone ||
      !password ||
      !firstName ||
      !lastName ||
      !dateOfBirth
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields to start onboarding." });
    }

    if (
      (!panVerification || panVerification.valid !== true) &&
      status !== "free"
    ) {
      return res
        .status(400)
        .json({ message: "PAN verification is required and must be valid." });
    }

    // Prepare base user fields
    const baseUpdate: any = {
      phone,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      address_1: address1 || null,
      address_2: address2 || null,
      state: state || null,
      city: city || null,
      pin_code: pinCode || null,
      company: company || null,
      pan_card_number: panCard,
      status,
      pan_verification_metadata: panVerification,
      role: role,
      plan_id,
    };

    // If a plan is attached at onboarding (e.g. free tier),
    // pre-compute subscription start and expiry dates based on plan duration.
    if (plan_id) {
      try {
        const { data: planRow, error: planError } = await supabase
          .from("membership_plans")
          .select("duration_months")
          .eq("plan_id", plan_id as any)
          .maybeSingle();

        if (!planError && planRow) {
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
        }
      } catch {
        // If membership_plans lookup fails, continue without subscription dates.
      }
    }

    let userId: string | null = null;
    const hashedPassword = await bcrypt.hash(password, config.salt_rounds);
    const username =
      email.split("@")[0] + `_${Math.random().toString(36).substring(2, 7)}`;
    const { data: inserted, error: insError } = await supabase
      .from("users")
      .insert({
        email,
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
        typeof insError.message === "string" &&
        insError.message.includes("users_pan_card_number_key")
      ) {
        return res.status(400).json({
          message: "This PAN is already registered with another account.",
        });
      }
      return res.status(500).json({ message: insError.message });
    }
    userId = inserted?.id || null;

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

    // Issue a session cookie so subsequent steps are authenticated
    try {
      const token = generateToken(userId as string, email);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
    } catch {}

    return res.status(200).json({
      message: "Onboarding started. User saved.",
      user: { id: userId, email, status },
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
      const { error: paymentError } = await supabase
        .from("payment_history")
        .insert({
          transaction_status: "SUCCESS",
          plan_id: plan_id,
          user_id: user_id,
          payer_email: payer_email,
          transaction_id: crypto.randomUUID(),
          coupon_applied: coupon?.coupon_id,
          created_at: startDate.toISOString(),
        })
        .maybeSingle();

      if (paymentError) {
        return res.status(500).json({
          error: paymentError.message || "Error saving payment history",
        });
      }
    } catch (e: any) {
      return res
        .status(500)
        .json({ error: e?.message || "Failed to insert payment history" });
    }

    // Compute subscription window based on plan duration
    let subscriptionStartDate: string | null = null;
    let subscriptionEndDate: string | null = null;
    try {
      const { data: planRow, error: planError } = await supabase
        .from("membership_plans")
        .select("duration_months")
        .eq("plan_id", plan_id as any)
        .maybeSingle();

      if (!planError && planRow) {
        subscriptionStartDate = startDate.toISOString().split("T")[0];
        const durationMonths = (planRow as any).duration_months;
        if (typeof durationMonths === "number" && durationMonths > 0) {
          const end = new Date(startDate);
          end.setMonth(end.getMonth() + durationMonths);
          subscriptionEndDate = end.toISOString().split("T")[0];
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

      // Mark coupon as used / expired (best-effort; do not block user activation)
      if (coupon?.coupon_id) {
        try {
          const nextUsedCount =
            typeof coupon.used_count === "number" ? coupon.used_count + 1 : 1;

          await supabase
            .from("coupons")
            .update({
              used_count: nextUsedCount,
              active: false,
              updated_at: new Date().toISOString(),
            })
            .eq("coupon_id", coupon.coupon_id);
        } catch (e) {
          console.error("Failed to mark coupon as used/expired", e);
        }
      }
      // Increment coupon usage after successful application
      try {
        await incrementCouponUsage(coupon_code!);
      } catch (e: any) {
        console.error("Failed to increment coupon usage:", e);
        // Do not fail the request if coupon increment fails
      }

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
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    const { data: user, error } = await supabase
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
            plan_id
          ),
          created_at,
          updated_at,
          status,
          role,
          digio_documents(document_id)
        `
      )
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};
