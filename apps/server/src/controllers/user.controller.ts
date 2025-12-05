import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email";
import { supabase } from "../supabase";
import { config } from "../utils/config";

// Utility to safely normalize a date string (returns yyyy-mm-dd, or null)
const normalizeDate = (value: any) => {
  if (typeof value !== "string") return value;
  // Handles formats like "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ssZ"
  return value.split("T")[0];
};

// Utility to perform null/undefined/empty check
const isNullOrEmpty = (val: any) =>
  val === undefined ||
  val === null ||
  (typeof val === "string" && val.trim() === "");

// #region GET All Users with Membership Plan
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Select all user fields (except password) + joined membership_plan
    const { data, error } = await supabase.from("users").select(`
      id,
      username,
      email,
      first_name,
      last_name,
      role,
      phone,
      pan_card_number,
      address_1,
      address_2,
      state,
      city,
      pin_code,
      date_of_birth,
      company,
      status,
      plan_id,
      subscription_start_date,
      subscription_end_date,
      created_at,
      updated_at,
      membership_plans (
        plan_code,
        plan_id
      )
    `);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data ?? []);
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ error: "Failed to get users" });
  }
};
// #endregion

// #region GET User by ID with Membership Plan
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNullOrEmpty(id)) {
    return res.status(400).json({ error: "User id is required." });
  }
  try {
    // Select all user fields (except password) + joined membership_plan
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        phone,
        pan_card_number,
        address_1,
        address_2,
        state,
        city,
        pin_code,
        date_of_birth,
        company,
        status,
        plan_id,
        subscription_start_date,
        subscription_end_date,
        created_at,
        updated_at,
        membership_plans (
        plan_code,
        plan_id
      )
      `
      )
      .eq("id", id)
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ error: "Failed to get user by id" });
  }
};
// #endregion

// #region CREATE User
export const createUser = async (req: Request, res: Response) => {
  try {
    // all required & optional fields as per AddMemberModal
    const {
      username,
      email,
      first_name,
      last_name,
      password,
      role,
      phone,
      pan_card_number,
      address_1,
      address_2,
      state,
      city,
      pin_code,
      date_of_birth,
      company,
      status,
      plan_id,
      subscription_start_date,
      subscription_end_date,
      sendSignupEmail,
    } = req.body ?? {};

    // Required fields validation (matching AddMemberModal)
    if (
      isNullOrEmpty(username) ||
      isNullOrEmpty(email) ||
      isNullOrEmpty(first_name) ||
      isNullOrEmpty(last_name) ||
      isNullOrEmpty(password) ||
      isNullOrEmpty(phone) ||
      isNullOrEmpty(pan_card_number) ||
      isNullOrEmpty(address_1) ||
      isNullOrEmpty(state) ||
      isNullOrEmpty(city) ||
      isNullOrEmpty(pin_code) ||
      isNullOrEmpty(date_of_birth)
    ) {
      return res.status(400).json({
        error:
          "Missing one or more required fields: username, email, first_name, last_name, password, phone, pan_card_number, address_1, state, city, pin_code, date_of_birth.",
      });
    }

    // Validate and parse date_of_birth
    const dobIso = normalizeDate(date_of_birth);
    if (!dobIso || isNaN(Date.parse(dobIso))) {
      return res.status(400).json({
        error: "A valid date_of_birth is required (ISO format or YYYY-MM-DD).",
      });
    }

    // Subscription plan parsing
    let finalPlanId: number | null = null;
    if (!isNullOrEmpty(plan_id)) {
      // allow number or string
      const parsed =
        typeof plan_id === "string" ? parseInt(plan_id, 10) : plan_id;
      if (!isNaN(parsed)) finalPlanId = parsed;
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare payload
    const userPayload: any = {
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword,
      role: role || "employee", // fallback default
      phone,
      pan_card_number,
      address_1,
      address_2: address_2 || null,
      state,
      city,
      pin_code,
      date_of_birth: dobIso,
      company: company ?? null,
      status: status ?? "active",
    };
    if (finalPlanId !== null) userPayload.plan_id = finalPlanId;
    if (!isNullOrEmpty(subscription_start_date)) {
      userPayload.subscription_start_date = normalizeDate(
        subscription_start_date
      );
    }
    if (!isNullOrEmpty(subscription_end_date)) {
      userPayload.subscription_end_date = normalizeDate(subscription_end_date);
    }

    // Insert and retrieve inserted row(s) without password field, joined membership_plan
    const { data, error } = await supabase.from("users").insert([userPayload])
      .select(`
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        phone,
        pan_card_number,
        address_1,
        address_2,
        state,
        city,
        pin_code,
        date_of_birth,
        company,
        status,
        plan_id,
        subscription_start_date,
        subscription_end_date,
        created_at,
        updated_at,
        membership_plans (
        plan_code,
        plan_id
      )
      `);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Send signup email if requested
    if (sendSignupEmail && Boolean(sendSignupEmail) === true) {
      const welcomeSenderEmail = process.env.CONNECT_EMAIL;
      if (!welcomeSenderEmail) {
        return res.status(500).json({
          error: "Welcome Sender email is missing from backend/envs.",
        });
      }

      try {
        await sendEmail({
          to: email,
          from: welcomeSenderEmail,
          subject: "Welcome to Bastion Research!",
          text: `Hello ${first_name},\n\nWelcome to Bastion Research! Your account has been created successfully.\n\nYour username is: ${username}\n\nYou can now log in with the password you set.\n\nBest regards,\nThe Bastion Research Team`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f9; padding: 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding: 32px 32px 16px 32px; border-bottom: 1px solid #eaeaea;">
                    <img src="${config.app_url}/media/header-logo.webp" alt="Bastion Research" style="height: 40px; display: block; margin-bottom: 16px;">
                    <h2 style="margin: 0 0 8px 0; color: #222;">Welcome to Bastion Research!</h2>
                    <p style="margin: 0; color: #666; font-size: 15px;">Your account has been created successfully.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #222;">
                      <tr>
                        <td style="padding: 8px 0; width: 120px; color: #888;">Username:</td>
                        <td style="padding: 8px 0;"><strong>${username}</strong></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; color: #888;">You can now log in with the password you set.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 32px 24px 32px; color: #888; font-size: 13px; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0;">Best regards,<br>The Bastion Research Team</p>
                  </td>
                </tr>
              </table>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Do not fail the whole request if email fails
      }
    }

    res.status(201).json(data);
  } catch (err: any) {
    console.error("createUser error:", err);
    res.status(500).json({
      error: err?.message ? err.message : "Failed to create user",
    });
  }
};
// #endregion

// #region UPDATE User with Membership Plan returned
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNullOrEmpty(id)) {
    return res.status(400).json({ error: "User id is required." });
  }

  // The full update schema (all updatable fields as in EditMemberModal)
  const updatableFields: (keyof typeof req.body)[] = [
    "username",
    "email",
    "first_name",
    "last_name",
    "phone",
    "pan_card_number",
    "address_1",
    "address_2",
    "state",
    "city",
    "pin_code",
    "date_of_birth",
    "company",
    "status",
    "plan_id",
    "role",
    "subscription_start_date",
    "subscription_end_date",
  ];

  const updatePayload: Record<string, any> = {};
  for (const key of updatableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      // Explicitly allow setting value to empty string/null if sent
      updatePayload[key as string] = req.body[key];
    }
  }

  // Defensive check for at least one field to update
  if (Object.keys(updatePayload).length === 0) {
    return res
      .status(400)
      .json({ error: "No user fields provided for update." });
  }

  // Null-safe and format validation/normalization
  if (
    typeof updatePayload.date_of_birth === "string" &&
    updatePayload.date_of_birth.trim()
  ) {
    updatePayload.date_of_birth = normalizeDate(updatePayload.date_of_birth);
    if (isNaN(Date.parse(updatePayload.date_of_birth))) {
      return res.status(400).json({ error: "Invalid date_of_birth format." });
    }
  }

  // Normalize subscription dates
  if (
    typeof updatePayload.subscription_start_date === "string" &&
    updatePayload.subscription_start_date.trim()
  ) {
    updatePayload.subscription_start_date = normalizeDate(
      updatePayload.subscription_start_date
    );
  }
  if (
    typeof updatePayload.subscription_end_date === "string" &&
    updatePayload.subscription_end_date.trim()
  ) {
    updatePayload.subscription_end_date = normalizeDate(
      updatePayload.subscription_end_date
    );
  }

  // Plan id conversion
  if ("plan_id" in updatePayload && !isNullOrEmpty(updatePayload.plan_id)) {
    const parsed =
      typeof updatePayload.plan_id === "string"
        ? parseInt(updatePayload.plan_id, 10)
        : updatePayload.plan_id;
    updatePayload.plan_id = !isNaN(parsed) ? parsed : null;
  }

  try {
    // Null normalization for optional fields
    if (
      "address_2" in updatePayload &&
      isNullOrEmpty(updatePayload.address_2)
    ) {
      updatePayload.address_2 = null;
    }
    if ("company" in updatePayload && isNullOrEmpty(updatePayload.company)) {
      updatePayload.company = null;
    }

    // Update and select all fields except password, joined membership_plan
    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id).select(`
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        phone,
        pan_card_number,
        address_1,
        address_2,
        state,
        city,
        pin_code,
        date_of_birth,
        company,
        status,
        plan_id,
        subscription_start_date,
        subscription_end_date,
        created_at,
        updated_at,
        membership_plans (
        plan_code,
        plan_id
      )
      `);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found or not updated." });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("updateUser error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Failed to update user" });
  }
};
// #endregion

// #region DELETE User
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNullOrEmpty(id)) {
    return res.status(400).json({ error: "User id is required." });
  }
  try {
    // Return deleted user row(s) but exclude password, joined membership_plan
    const { data, error } = await supabase.from("users").delete().eq("id", id)
      .select(`
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        phone,
        pan_card_number,
        address_1,
        address_2,
        state,
        city,
        pin_code,
        date_of_birth,
        company,
        status,
        plan_id,
        subscription_start_date,
        subscription_end_date,
        created_at,
        updated_at,
        membership_plans (
        plan_code,
        plan_id
      )
      `);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ error: "User not found or already deleted." });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
// #endregion
