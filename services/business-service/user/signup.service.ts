import bcrypt from "bcrypt";
import type { EmailSignupRequestData, GoogleSignupRequestData, VerifyEmailRequestData, SetPasswordRequestData } from "../../dto-service/modules.export";
import { UserStatus } from "../../dto-service/modules.export";
import { sendVerificationEmail, generateVerificationToken } from "../../helper-service/email.helper";
import { ErrorMessages, Platform } from "../../dto-service/constants/modules.export";
import {
  findUserByEmail,
  findUserByGoogleId,
  findUserByVerificationToken,
  createUser,
  updateUser,
} from "../../persistence-service/user/user.persistence.service";
import { AppError } from "../../helper-service/AppError";

/**
 * Email signup service
 * Creates a new user with email auth provider and sends verification email
 */
export const emailSignupService = async (data: EmailSignupRequestData): Promise<{ message: string }> => {
  const { email, firstName, lastName, platform } = data;

  // Check if user already exists
  const existingUser = await findUserByEmail(email, platform);
  if (existingUser) {
    throw new AppError(ErrorMessages.UserAlreadyExists, 400);
  }

  // Generate verification token
  const { token, expiry } = generateVerificationToken();

  // Create user
  const newUser = await createUser({
    email: email.toLowerCase(),
    firstName,
    lastName,
    platform: platform.toLowerCase(),
    authProvider: "email",
    isEmailVerified: false,
    verificationToken: token,
    verificationTokenExpiry: expiry,
    status: UserStatus.ACTIVE,
  });

  // Send verification email
  await sendVerificationEmail(email, firstName, token);

  return {
    message: "Verification email sent. Please check your inbox.",
  };
};

/**
 * Google signup service
 * Creates a user with Google OAuth provider (auto-verified)
 */
export const googleSignupService = async (data: GoogleSignupRequestData): Promise<{ email: string; message: string }> => {
  // TODO: Verify google token with google-auth-library
  // For now, we'll assume the token is valid
  // const ticket = await client.verifyIdToken({ idToken: googleToken });
  // const payload = ticket.getPayload();

  const { firstName, lastName, platform } = data;

  // This is a placeholder - replace with actual Google token verification
  // For demonstration, we'll create a user with a mock Google ID
  const googleId = "google_" + Date.now();

  // Check if user already exists with this Google ID
  const existingGoogleUser = await findUserByGoogleId(googleId);
  if (existingGoogleUser) {
    throw new AppError("Google account already registered", 400);
  }

  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@google.placeholder`; // Placeholder

  // Check if email already registered with another provider
  const existingEmailUser = await findUserByEmail(email, platform);
  if (existingEmailUser) {
    throw new AppError("Email already registered with another account", 400);
  }

  // Create user (auto-verified for Google signup)
  const newUser = await createUser({
    email: email.toLowerCase(),
    firstName,
    lastName,
    platform: platform.toLowerCase(),
    authProvider: "google",
    googleId,
    isEmailVerified: true,
    status: UserStatus.ACTIVE,
  });

  return {
    email: newUser.email,
    message: "Google signup successful",
  };
};

/**
 * Verify email service
 * Verifies the user's email using the verification token
 */
export const verifyEmailService = async (data: VerifyEmailRequestData): Promise<{ message: string }> => {
  const { token, email } = data;

  // Find user by verification token
  const user = await findUserByVerificationToken(token);

  if (!user || user.email !== email.toLowerCase()) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  // Update user as verified
  await updateUser(user._id?.toString() || "", {
    isEmailVerified: true,
    verificationToken: undefined,
    verificationTokenExpiry: undefined,
  });

  return {
    message: "Email verified successfully. Please set your password.",
  };
};

/**
 * Set password service
 * Sets password for email-signup users after email verification
 */
export const setPasswordService = async (data: SetPasswordRequestData): Promise<{ message: string }> => {
  const { email, password, confirmPassword } = data;

  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  // Find user
  const user = await findUserByEmail(email, Platform.ENTERPRISE); // Adjust platform as needed

  if (!user) {
    throw new AppError(ErrorMessages.UserNotFound, 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Email not verified", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user with password
  await updateUser(user._id?.toString() || "", {
    password: hashedPassword,
  });

  return {
    message: "Password set successfully. You can now login.",
  };
};
