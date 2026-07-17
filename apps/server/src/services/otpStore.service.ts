import crypto from "crypto";
import { supabase } from "../supabase";

const OTP_CODES_TABLE = "otp_codes";

type OtpType = "email" | "phone";

type ValidateOtpResult = {
  valid: boolean;
  reason?: "not_found" | "mismatch" | "expired" | "store_error";
};

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const saveOtp = async ({
  identifier,
  type,
  otp,
  expiresAt,
}: {
  identifier: string;
  type: OtpType;
  otp: string;
  expiresAt: number;
}) => {
  const { error } = await supabase.from(OTP_CODES_TABLE).upsert(
    {
      identifier,
      type,
      otp_hash: hashOtp(otp),
      expires_at: new Date(expiresAt).toISOString(),
      consumed_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "identifier,type" },
  );

  if (error) {
    console.error("Supabase error while saving OTP:", error);
    throw new Error("Failed to save OTP.");
  }
};

export const validateOtp = async (
  identifier: string,
  type: OtpType,
  otp: string,
): Promise<ValidateOtpResult> => {
  const { data: entry, error } = await supabase
    .from(OTP_CODES_TABLE)
    .select("id, otp_hash, expires_at, consumed_at")
    .eq("identifier", identifier)
    .eq("type", type)
    .is("consumed_at", null)
    .maybeSingle();

  if (error) {
    console.error("Supabase error while validating OTP:", error);
    return { valid: false, reason: "store_error" };
  }

  if (!entry) return { valid: false, reason: "not_found" };

  if (entry.otp_hash !== hashOtp(otp))
    return { valid: false, reason: "mismatch" };

  if (Date.now() > new Date(entry.expires_at).getTime()) {
    await supabase
      .from(OTP_CODES_TABLE)
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", entry.id);
    return { valid: false, reason: "expired" };
  }

  const { error: consumeError } = await supabase
    .from(OTP_CODES_TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", entry.id)
    .is("consumed_at", null);

  if (consumeError) {
    console.error("Supabase error while consuming OTP:", consumeError);
    return { valid: false, reason: "store_error" };
  }

  return { valid: true };
};
