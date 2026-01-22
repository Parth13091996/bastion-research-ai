import nodemailer from "nodemailer";

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
