import {createOrderForPlanService,resolvePlanById} from '../services/cashfree-plans-orders.service';
import {checkoutAmount} from '../services/core-checkout.service';
import {AccessError} from '../services/premium-access.service';
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

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getAuthCookieOptions = () => {
  const isSecure =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production" ||
    true;

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
    maxAge: 24 * 60 * 60 * 1000,
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

    res.cookie("token", token, getAuthCookieOptions());

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
          .select("plan_code, plan_id, plan_name, duration_months")
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
    let planDetails: any = null;
    if(plan_id) {
      const {data,error}=await supabase.from('membership_plans').select('plan_id,plan_code,plan_name,price_amount').eq('plan_id',plan_id).maybeSingle();
      if(error||!data)return res.status(400).json({message:'Invalid plan'});
      planDetails=data;
    }
    const freeSignup=planDetails?.plan_code==='freemium' && Number(planDetails.price_amount)===0;
    baseUpdate.role=freeSignup?'free_subscriber':'core_subscriber';
    baseUpdate.status=freeSignup?'free':'onboarded';
    baseUpdate.plan_id=freeSignup?planDetails.plan_id:null;
    baseUpdate.subscription_start_date=null;
    baseUpdate.subscription_end_date=null;

    let userId: string | null = null;
    const hashedPassword = await bcrypt.hash(password, config.salt_rounds);
    const normalizedEmail = normalizeEmail(email);
    const username =
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

    // Issue a session cookie so subsequent steps are authenticated
    try {
      const token = generateToken(userId as string, normalizedEmail);
      res.cookie("token", token, getAuthCookieOptions());
    } catch {}

    return res.status(200).json({
      message: "Onboarding started. User saved.",
      user: { id: userId, email: normalizedEmail, status:baseUpdate.status },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to start onboarding" });
  }
};

export const zeroAmountAccountCreation = async (req: Request,res: Response) => {
  try {
    const user=(req as any).user;
    if(!user || (req.body.user_id && req.body.user_id!==user.id))return res.status(403).json({message:'Not authorized for this account'});
    const plan=await resolvePlanById(Number(req.body.plan_id));
    if(await checkoutAmount(plan,user,req.body.coupon_code)!==0)return res.status(400).json({message:'This plan requires payment.'});
    await createOrderForPlanService({planId:plan.plan_id,customer_id:user.id,customer_email:user.email,customer_phone:user.phone,discount_amount:0,coupon_code:req.body.coupon_code});
    const {data,error}=await supabase.from('users').select('id,email,first_name,last_name,status,role,plan_id,subscription_start_date,subscription_end_date,membership_plans(plan_id,plan_code)').eq('id',user.id).single();
    if(error)throw error;
    clearOnboardingDropOffForUser(user.id);
    return res.status(200).json({user:data});
  }catch(e:any){return res.status(e instanceof AccessError?e.status:500).json({message:e instanceof AccessError?e.message:'Unable to activate subscription'});}
};

export const getUserSession = async (req: Request, res: Response) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret) as { id: string; email: string };

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
            duration_months
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
            .select("plan_code, plan_id, plan_name, duration_months")
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
    ...getAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfully" });
};
