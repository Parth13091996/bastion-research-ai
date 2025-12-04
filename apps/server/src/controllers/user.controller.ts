import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email";
import { supabase } from "../supabase";
import { config } from "../utils/config";

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const createUser = async (req: Request, res: Response) => {
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
  } = req.body;

  // Validate and parse the date of birth
  if (!date_of_birth || isNaN(Date.parse(date_of_birth))) {
    return res
      .status(400)
      .json({ message: "A valid date of birth is required." });
  }
  const dob = new Date(date_of_birth);

  // Normalize optional subscription dates (expecting YYYY-MM-DD or ISO)
  const normalizeDate = (value: any) =>
    typeof value === "string" ? value.split("T")[0] : value;

  const normalizedSubscriptionStart = subscription_start_date
    ? normalizeDate(subscription_start_date)
    : undefined;
  const normalizedSubscriptionEnd = subscription_end_date
    ? normalizeDate(subscription_end_date)
    : undefined;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from("users")
    .insert([
      (() => {
        const payload: any = {
          username,
          email,
          first_name,
          last_name,
          password: hashedPassword,
          // user_role enum in DB, default to 'employee' if not provided
          role: role || "employee",
          phone,
          pan_card_number,
          address_1,
          address_2,
          state,
          city,
          pin_code,
          date_of_birth: dob,
          company,
          status: status || "active",
        };

        // Optional subscription metadata for admin-created users
        if (plan_id !== undefined && plan_id !== null && plan_id !== "") {
          const numericPlanId =
            typeof plan_id === "string" ? parseInt(plan_id, 10) : plan_id;
          if (!Number.isNaN(numericPlanId)) {
            payload.plan_id = numericPlanId;
          }
        }
        if (normalizedSubscriptionStart) {
          payload.subscription_start_date = normalizedSubscriptionStart;
        }
        if (normalizedSubscriptionEnd) {
          payload.subscription_end_date = normalizedSubscriptionEnd;
        }

        return payload;
      })(),
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const welcomeSenderEmail = process.env.CONNECT_EMAIL;
  if (!welcomeSenderEmail) {
    return res
      .status(500)
      .json({ error: "Welcome Sender email is missing from backend/envs." });
  }

  // Send signup email notification
  if (req.body.sendSignupEmail) {
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
    }
  }

  res.status(201).json(data);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const allowedFields = [
    "username",
    "email",
    "first_name",
    "last_name",
    "phone",
    "address_1",
    "address_2",
    "state",
    "city",
    "pin_code",
    "date_of_birth",
    "company",
    "pan_card_number",
    "status",
    "plan_id",
    "subscription_start_date",
    "subscription_end_date",
  ] as const;

  const body = req.body ?? {};

  // Build update payload with only provided fields
  const updatePayload: Record<string, any> = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updatePayload[key] = body[key];
    }
  }

  // Normalize date_of_birth if present (expecting YYYY-MM-DD)
  if (typeof updatePayload.date_of_birth === "string") {
    // If it contains a time portion, trim to date only
    const dob = updatePayload.date_of_birth.split("T")[0];
    updatePayload.date_of_birth = dob;
  }

  // Normalize subscription dates (expecting YYYY-MM-DD)
  const normalizeDate = (value: any) =>
    typeof value === "string" ? value.split("T")[0] : value;

  if (updatePayload.subscription_start_date) {
    updatePayload.subscription_start_date = normalizeDate(
      updatePayload.subscription_start_date
    );
  }

  if (updatePayload.subscription_end_date) {
    updatePayload.subscription_end_date = normalizeDate(
      updatePayload.subscription_end_date
    );
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
