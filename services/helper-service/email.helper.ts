import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter;

/**
 * Initialize email transporter
 */
export const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
): Promise<void> => {
  if (!transporter) {
    throw new Error("Email service not initialized");
  }

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or copy and paste this link: ${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  if (!transporter) {
    throw new Error("Email service not initialized");
  }

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Set Your Password",
    html: `
      <h1>Hello, ${firstName}!</h1>
      <p>Click the link below to set your password:</p>
      <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Set Password
      </a>
      <p>Or copy and paste this link: ${resetLink}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Generate verification token
 */
export const generateVerificationToken = (): { token: string; expiry: Date } => {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours expiry
  return { token, expiry };
};
