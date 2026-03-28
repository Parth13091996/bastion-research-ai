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

interface DropOffSummaryEntry {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt: string;
}

interface DropOffSummaryPayload {
  to: string;
  dateLabel: string;
  entries: DropOffSummaryEntry[];
}

interface SubscriptionExpirySummaryEntry {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  planName?: string | null;
  subscriptionEndDate?: string | null;
}

interface SubscriptionExpirySummaryPayload {
  to: string;
  monthLabel: string;
  entries: SubscriptionExpirySummaryEntry[];
}

const buildEntryLabel = (entry: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  const nameParts: string[] = [];
  if (entry.firstName?.trim()) nameParts.push(entry.firstName.trim());
  if (entry.lastName?.trim()) nameParts.push(entry.lastName.trim());
  return nameParts.join(" ") || entry.email;
};

const formatPlanName = (entry: SubscriptionExpirySummaryEntry) => {
  return entry.planName?.trim() || "(plan not recorded)";
};

export const sendDropOffSummaryEmail = async (
  payload: DropOffSummaryPayload
): Promise<void> => {
  const sender = getSenderEmail();
  if (!sender) {
    console.warn(
      "CONNECT_EMAIL is not configured; skipping drop-off summary email."
    );
    return;
  }

  const subject = `Daily Drop-Off Summary - ${payload.dateLabel}`;
  const hasEntries = payload.entries.length > 0;

  const textBody = hasEntries
    ? payload.entries
        .map((entry) => {
          const personLabel = buildEntryLabel(entry);
          return `- ${personLabel} (${entry.email}${entry.phone ? `, ${entry.phone}` : ""}) – Registered at ${formatDateForEmail(entry.createdAt)}`;
        })
        .join("\n")
    : `There were no new drop-offs on ${payload.dateLabel}.`;

  const htmlEntries = hasEntries
    ? `<table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Customer</th>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Contact</th>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${payload.entries
              .map((entry) => {
                const personLabel = buildEntryLabel(entry);
                return `<tr>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${personLabel}</td>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${entry.email}${entry.phone ? `<br/><small>${entry.phone}</small>` : ""}</td>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${formatDateForEmail(entry.createdAt)}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>`
    : `<p style="margin:0;">There were no new drop-offs on ${payload.dateLabel}.</p>`;

  const htmlBody = `
    <div style="font-family:'Segoe UI', Arial, sans-serif; background:#f8fafc; padding:32px 16px;">
      <div style="max-width:720px; margin:0 auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 10px 35px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg, #7f1d1d, #450a0a); color:#fff; padding:28px;">
          <h1 style="margin:0; font-size:24px;">Daily Drop-Off Summary</h1>
          <p style="margin:8px 0 0; font-size:16px;">${payload.dateLabel}</p>
        </div>
        <div style="padding:28px; color:#0f172a; font-size:15px; line-height:1.6;">
          <p>The following users started the onboarding process for Bastion Core but did not complete the payment.</p>
          ${htmlEntries}
          <p style="margin:24px 0 0;">Follow up with these customers to assist them with the onboarding process.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: payload.to,
      from: sender,
      subject,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Failed to send drop-off summary email", error);
  }
};

export const sendMonthlySubscriptionExpirySummaryEmail = async (
  payload: SubscriptionExpirySummaryPayload
): Promise<void> => {
  const sender = getSenderEmail();
  if (!sender) {
    console.warn(
      "CONNECT_EMAIL is not configured; skipping monthly subscription expiry summary email."
    );
    return;
  }

  const subject = `Subscriptions expiring in ${payload.monthLabel}`;
  const hasEntries = payload.entries.length > 0;
  const textBody = hasEntries
    ? payload.entries
        .map((entry) => {
          const personLabel = buildEntryLabel(entry);
          const planLabel = formatPlanName(entry);
          const endDateLabel =
            formatDateForEmail(entry.subscriptionEndDate) || "unknown date";
          return `- ${personLabel} (${entry.email}) – ${planLabel} ends on ${endDateLabel}`;
        })
        .join("\n")
    : `There are no subscriptions scheduled to expire in ${payload.monthLabel}.`;

  const htmlEntries = hasEntries
    ? `<table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Subscriber</th>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Plan</th>
              <th style="text-align:left; padding:8px; border-bottom: 2px solid #0f172a;">Expiry date</th>
            </tr>
          </thead>
          <tbody>
            ${payload.entries
              .map((entry) => {
                const personLabel = buildEntryLabel(entry);
                const planLabel = formatPlanName(entry);
                const endDateLabel =
                  formatDateForEmail(entry.subscriptionEndDate) || "Unknown";
                return `<tr>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${personLabel}<br/><small>${entry.email}</small></td>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${planLabel}</td>
                  <td style="padding:8px; border-bottom: 1px solid #e2e8f0;">${endDateLabel}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>`
    : `<p style="margin:0;">There are no subscriptions scheduled to expire in ${payload.monthLabel}.</p>`;

  const htmlBody = `
    <div style="font-family:'Segoe UI', Arial, sans-serif; background:#f8fafc; padding:32px 16px;">
      <div style="max-width:720px; margin:0 auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 10px 35px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg, #001e3c, #0f172a); color:#fff; padding:28px;">
          <h1 style="margin:0; font-size:24px;">Subscriptions expiring in ${payload.monthLabel}</h1>
          <p style="margin:8px 0 0; font-size:16px;">Here’s the list of subscriptions that are set to end during ${payload.monthLabel}.</p>
        </div>
        <div style="padding:28px; color:#0f172a; font-size:15px; line-height:1.6;">
          ${htmlEntries}
          <p style="margin:24px 0 0;">If you need any help managing renewals, reply to this email or log in to the admin console.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: payload.to,
      from: sender,
      subject,
      text: `Subscriptions expiring in ${payload.monthLabel}\n\n${textBody}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Failed to send monthly subscription expiry summary", error);
  }
};
