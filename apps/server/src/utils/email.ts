import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Create a transporter
  // Note: These credentials should be stored in environment variables.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: '"Bastion Research" <no-reply@bastionresearch.in>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  console.log(mailOptions, 'optios')

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
