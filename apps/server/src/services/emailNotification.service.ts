import sendEmail, { EmailOptions } from "../utils/email";
import { config } from "../utils/config";

const formatDateForEmail = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getSenderEmail = () => process.env.CONNECT_EMAIL;

const getAppUrl = () => (config.app_url || "https://app")?.replace(/\/$/, "");

interface WelcomeEmailPayload {
  to: string;
  firstName?: string;
  username?: string;
  planName?: string;
}

interface SubscriptionReminderPayload {
  to: string;
  firstName?: string;
  planName?: string;
  subscriptionEndDate?: string | null;
}

const buildUsernameLine = (username?: string) =>
  username ? `Username: ${username}\n` : "";

export const sendWelcomeEmail = async (
  payload: WelcomeEmailPayload
): Promise<void> => {
  const sender = getSenderEmail();
  if (!sender) {
    console.warn("CONNECT_EMAIL is not configured; skipping welcome email.");
    return;
  }

  const friendlyName = payload.firstName?.trim() || "there";
  const planLine = payload.planName
    ? `Thank you for joining the ${payload.planName} plan.`
    : "";
  const usernameLine = buildUsernameLine(payload.username);
  const appUrl = getAppUrl();
  const subject = "Welcome to Bastion Research!";

  const emailOptions: EmailOptions = {
    to: payload.to,
    from: sender,
    subject,
    text: `Hi ${friendlyName},\n\n${planLine} Your account is ready.${usernameLine ? `\n${usernameLine}` : ""} Visit ${appUrl} to log in.\n\nBest,\nBastion Research Team`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f8fb; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);">
          <div style="background: #000814; color: #fff; padding: 24px;">
            <h1 style="margin: 0; font-size: 24px;">Welcome aboard, ${friendlyName}!</h1>
            <p style="margin: 8px 0 0; font-size: 16px;">${planLine || "Your Bastion Research account is now active."}</p>
          </div>
          <div style="padding: 24px; color: #0f172a; font-size: 15px; line-height: 1.6;">
            ${payload.username ? `<p><strong>Username:</strong> ${payload.username}</p>` : ""}
            <p>You can head to the dashboard anytime at <a href="${appUrl}" style="color: #1d4ed8;">${appUrl}</a> to explore insights, upload documents, and manage your plan.</p>
            <p style="margin: 24px 0 0;">Best regards,<br/>The Bastion Research Team</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await sendEmail(emailOptions);
  } catch (error) {
    console.error("Failed to send welcome email", error);
  }
};

export const sendSubscriptionExpiryReminderEmail = async (
  payload: SubscriptionReminderPayload
): Promise<void> => {
  const sender = getSenderEmail();
  if (!sender) {
    console.warn(
      "CONNECT_EMAIL is not configured; skipping subscription expiry reminder email."
    );
    return;
  }

  const friendlyName = payload.firstName?.trim() || "there";
  const planLabel = payload.planName?.trim() || "your Bastion Research membership";
  const endDateLabel =
    formatDateForEmail(payload.subscriptionEndDate) || "soon";
  const appUrl = getAppUrl();
  const emailOptions: EmailOptions = {
    to: payload.to,
    from: sender,
    subject: "Your Bastion Research subscription expires in 7 days",
    text: `Hi ${friendlyName},\n\nThis is a reminder that ${planLabel} will expire on ${endDateLabel}. Visit ${appUrl} to renew or update your plan before the service is interrupted.\n\nBest regards,\nBastion Research Team`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 32px 16px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);">
          <div style="background: linear-gradient(135deg, #00213e, #0f172a); color: #fff; padding: 26px;">
            <h1 style="margin: 0; font-size: 24px;">Subscription expiring in one week</h1>
            <p style="margin: 12px 0 0; font-size: 16px;">${planLabel} will end on ${endDateLabel}.</p>
          </div>
          <div style="padding: 26px; color: #0f172a; font-size: 15px; line-height: 1.7;">
            <p>Hi ${friendlyName},</p>
            <p>We wanted to remind you that <strong>${planLabel}</strong> is scheduled to renew on <strong>${endDateLabel}</strong>. Please make sure to visit <a href="${appUrl}" style="color: #1d4ed8;">${appUrl}</a> to manage your subscription before the expiry date.</p>
            <p>If you already renewed, you can safely ignore this message.</p>
            <p style="margin: 24px 0 0;">Warm regards,<br/>The Bastion Research Team</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await sendEmail(emailOptions);
  } catch (error) {
    console.error("Failed to send subscription expiry reminder", error);
  }
};
