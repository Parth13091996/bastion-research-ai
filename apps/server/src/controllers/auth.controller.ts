import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { supabase } from "../supabase";

const generateToken = (id: string, email: string, expiresIn: string = "1d") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, email }, secret, { expiresIn: expiresIn as any });
};

// This function will be called internally after successful payment.
export const createUserAfterOnboarding = async (userData: any) => {
  const {
    email,
    phone,
    password,
    firstName,
    lastName,
    panCard,
    dateOfBirth,
    aadharCard,
    bankAccount,
    ifscCode,
  } = userData;

  // Basic validation
  if (
    !email ||
    !phone ||
    !password ||
    !firstName ||
    !lastName ||
    !panCard ||
    !dateOfBirth
  ) {
    console.error("Validation failed for userData:", userData);
    throw new Error("Missing required fields for user creation.");
  }

  // Check if user already exists
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("email, phone")
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (existingUserError) {
    console.error("Error checking for existing user:", existingUserError);
    throw existingUserError;
  }

  if (existingUser && existingUser.length > 0) {
    console.warn(`Attempted to create a user that already exists: ${email}`);
    return existingUser[0];
  }

  const hashedPassword = await bcrypt.hash(password, config.saltRounds);
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
      aadhar_card_number: aadharCard,
      bank_account_number: bankAccount,
      ifsc_code: ifscCode,
      status: "active",
      isPremium: true,
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

  return newUser;
};

// --- Standard Authentication ---

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
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
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
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

  res.status(200).json({
    message:
      "If an account with this email exists, a password reset link has been sent.",
  });
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
      .select("*")
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

// Endpoint to finalize onboarding and create the user after payment success
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
      message: "Failed to create user from onboarding data",
      error: error?.message,
    });
  }
};
