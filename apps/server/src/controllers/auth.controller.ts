import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { supabase } from "../supabase";
import crypto from "crypto";
import sendEmail from "../utils/email";
import { validateEmailOtp } from "./otp.controller";

const generateToken = (id: string, email: string, expiresIn: string = "1d") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, email }, secret, { expiresIn: expiresIn as any });
};

export const createUserAfterOnboarding = async (userData: any) => {
  const {
    email,
    phone,
    password,
    firstName,
    lastName,
    panCard,
    dateOfBirth,
    address1,
    address2,
    state,
    city,
    pinCode,
    company,
    panVerification,
    agreementSignatureUrl,
    agreementSignaturePath,
    agreementSignedAt,
  } = userData;

  // Basic validation
  if (
    !email ||
    !phone ||
    !password ||
    !firstName ||
    !lastName ||
    !dateOfBirth
  ) {
    console.error("Validation failed for userData:", userData);
    throw new Error("Missing required fields for user creation.");
  }

  if (!panVerification || !panVerification.valid) {
    throw new Error("PAN must be verified before onboarding can be completed.");
  }

  if (!agreementSignatureUrl) {
    throw new Error("Agreement signature is required to finalize onboarding.");
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    console.warn(`Attempted to create a user that already exists: ${email}`);
    throw new Error(`Attempted to create a user that already exists: ${email}`);
  }

  const hashedPassword = await bcrypt.hash(password, config.salt_rounds);
  const username =
    email.split("@")[0] + `_${Math.random().toString(36).substring(2, 7)}`;

  // Create the user
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      email,
      phone,
      password: hashedPassword,
      username,
      first_name: firstName,
      last_name: lastName,
      pan_card_number: panCard,
      date_of_birth: dateOfBirth,
      // optional address/company fields
      address_1: address1 || null,
      address_2: address2 || null,
      state: state || null,
      city: city || null,
      pin_code: pinCode || null,
      company: company || null,
      status: "active",
    })
    .select("id, email")
    .single();

  if (insertError) {
    console.error("Error inserting new user:", insertError);
    throw insertError;
  }
  if (!newUser) {
    throw new Error(
      "User not created after onboarding, but no error was thrown."
    );
  }

  // Try to persist optional metadata (ignore missing column errors)
  try {
    const optionalPayload: Record<string, any> = {};
    if (panVerification?.referenceId) {
      optionalPayload.pan_verification_reference = panVerification.referenceId;
    }
    if (panVerification?.status) {
      optionalPayload.pan_verification_status = panVerification.status;
    }
    if (panVerification?.checkedAt) {
      optionalPayload.pan_verified_at = panVerification.checkedAt;
    }
    if (agreementSignatureUrl) {
      optionalPayload.agreement_signature_url = agreementSignatureUrl;
    }
    if (agreementSignaturePath) {
      optionalPayload.agreement_signature_path = agreementSignaturePath;
    }
    if (agreementSignedAt) {
      optionalPayload.agreement_signed_at = agreementSignedAt;
    }

    if (Object.keys(optionalPayload).length > 0) {
      const { error: metadataError } = await supabase
        .from("users")
        .update(optionalPayload)
        .eq("id", newUser.id);

      if (metadataError) {
        const msg = metadataError?.message || "";
        if (/column .* does not exist/i.test(msg)) {
          console.warn(
            "Optional onboarding metadata columns missing. Skipping persistence.",
            msg
          );
        } else {
          console.error(
            "Failed to persist onboarding metadata for user",
            metadataError
          );
        }
      }
    }
  } catch (metaErr) {
    console.error("Unexpected error while saving onboarding metadata", metaErr);
  }

  return newUser;
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

export const createOrUpdateUserAfterKYC = async (
  req: Request,
  res: Response
) => {
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
    } = req.body || {};

    if (
      !email ||
      !phone ||
      !password ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !panCard
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields to start onboarding." });
    }
    if (!panVerification || panVerification.valid !== true) {
      return res
        .status(400)
        .json({ message: "PAN verification is required and must be valid." });
    }

    // Check existing user by email
    const { data: existingUserByEmail } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    const existingUser = existingUserByEmail;

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
      status: "onboarding",
      pan_verification_metadata: panVerification,
    };

    let userId: string | null = null;
    if (existingUser && existingUser.id) {
      // Update existing
      const { data: upd, error: updError } = await supabase
        .from("users")
        .update(baseUpdate)
        .eq("id", existingUser.id)
        .select("id, email")
        .single();
      if (updError) {
        return res.status(500).json({ message: updError.message });
      }
      userId = upd?.id || existingUser.id;
    } else {
      // Create new user with hashed password
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
        return res.status(500).json({ message: insError.message });
      }
      userId = inserted?.id || null;
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
      user: { id: userId, email, status: "onboarding" },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to start onboarding" });
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
        `id, username, first_name, last_name, phone, email, address_1, pan_card_number, address_2, state, city, pin_code, date_of_birth, company, created_at, updated_at, status, role, digio_documents(document_id)`
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

export const registerFromOnboarding = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // createUserAfterOnboarding already validates required fields and checks duplicates
    const newUser = (await createUserAfterOnboarding(userData)) as {
      id: any;
      email: any;
    };

    // Optionally, auto-login user here by setting a cookie
    try {
      const token = generateToken(newUser.id, newUser.email);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
    } catch {}

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error: any) {
    console.error("Onboarding finalize error:", error);
    return res.status(400).json({
      message: error?.message || "Failed to create user from onboarding data",
      error: error?.message,
    });
  }
};
