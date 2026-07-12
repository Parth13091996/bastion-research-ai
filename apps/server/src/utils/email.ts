import nodemailer from "nodemailer";

/**
 * Many SMTP providers (including Hostinger) require the From address to match the
 * authenticated mailbox (SMTP_USERNAME). A mismatch yields errors like:
 * "553 5.7.1 Sender address rejected: not owned by user ..."
 */
export function getResolvedSmtpFromAddress(): string | undefined {
  const username = process.env.SMTP_USERNAME?.trim();
  const explicit =
    process.env.SMTP_FROM?.trim() ||
    process.env.CONNECT_EMAIL?.trim() ||
    process.env.LEADS_EMAIL?.trim();

  if (!explicit && !username) {
    return undefined;
  }

  if (explicit && username && explicit.toLowerCase() !== username.toLowerCase()) {
    console.warn(
      `[email] From address (${explicit}) does not match SMTP_USERNAME (${username}). ` +
        "Using SMTP_USERNAME as the sender. Set CONNECT_EMAIL or SMTP_FROM to the same " +
        "address as SMTP_USERNAME, or use SMTP credentials for the mailbox you want in From."
    );
    return username;
  }

  return explicit || username;
}

export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

const sendEmail = async (options: EmailOptions) => {
  const nodeMailerOptions = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(nodeMailerOptions);
  const mailOptions = {
    to: options.to,
    from: options.from,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
