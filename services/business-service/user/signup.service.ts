import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import type { EmailSignupRequestData, GoogleSignupRequestData, VerifyEmailRequestData, SetPasswordRequestData, LoginUserRequestData, LoginResponse } from "../../dto-service/modules.export";
import { UserStatus, AccessTokenExpiry, AccessTokenExpiryInSeconds } from "../../dto-service/modules.export";
import { sendVerificationEmail, generateVerificationToken } from "../../helper-service/email.helper";
import { ErrorMessages, Platform } from "../../dto-service/constants/modules.export";
import { createJWTToken } from "../../helper-service/jwt.helper";
import {
    findUserByEmailSilently,
    findUserByGoogleId,
    findUserByVerificationToken,
    createUser,
    updateUser,
} from "../../persistence-service/user/user.persistence.service";
import { AppError } from "../../helper-service/AppError";

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const emailSignupService = async (
    data: EmailSignupRequestData
): Promise<{ message: string }> => {
    const { email, firstName, lastName, platform } = data;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmailSilently(
        normalizedEmail,
        platform
    );
    if (existingUser?.status === UserStatus.ACTIVE) {
        throw new AppError(ErrorMessages.UserAlreadyExists, 400);
    }
    const { token, expiry } = generateVerificationToken();
    // CASE 2: User exists but is INACTIVE → update token & resend email
    if (existingUser && existingUser.status === UserStatus.INACTIVE) {
        await updateUser(existingUser._id!, {
            verificationToken: token,
            verificationTokenExpiry: expiry,
            isEmailVerified: false,
        });

        await sendVerificationEmail(normalizedEmail, existingUser.firstName, token);

        return {
            message: "Verification email resent. Please check your inbox.",
        };
    }

    // CASE 3: User does not exist → create new user
    await createUser({
        email: normalizedEmail,
        firstName,
        lastName,
        platform,
        authProvider: "EMAIL",
        isEmailVerified: false,
        verificationToken: token,
        verificationTokenExpiry: expiry,
        status: UserStatus.INACTIVE, // important: keep inactive until verified
    });

    await sendVerificationEmail(normalizedEmail, firstName, token);

    return {
        message: "Verification email sent. Please check your inbox.",
    };
};

export const googleSignupService = async (data: GoogleSignupRequestData): Promise<{ email: string; firstName: string; lastName: string; message: string }> => {
    const { googleToken, platform } = data;

    let payload;
    try {
        // Verify google token with google-auth-library
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();

        if (!payload) {
            throw new AppError("Invalid Google token", 401);
        }
    } catch (error) {
        throw new AppError("Invalid or expired Google token", 401);
    }

    const googleId = payload.sub; // Google's unique user ID
    const email = payload.email;
    const givenName = payload.given_name || "";
    const familyName = payload.family_name || "";

    if (!email || !googleId) {
        throw new AppError("Invalid Google token - missing email or ID", 401);
    }

    // Check if user already exists with this Google ID
    const existingGoogleUser = await findUserByGoogleId(googleId);
    if (existingGoogleUser && existingGoogleUser.status === UserStatus.ACTIVE) {
        throw new AppError("Google account already registered", 400);
    }

    // Check if email already registered with another provider
    const existingEmailUser = await findUserByEmailSilently(email, platform);
    if (existingEmailUser && existingEmailUser.status === UserStatus.ACTIVE) {
        throw new AppError("Email already registered with another account", 400);
    }

    // Create user (auto-verified for Google signup)
    const newUser = await createUser({
        email: email.toLowerCase(),
        firstName: givenName,
        lastName: familyName,
        platform,
        authProvider: "GOOGLE",
        googleId,
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
    });

    return {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
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
    const { email, password, confirmPassword, platform } = data;

    if (password !== confirmPassword) {
        throw new AppError("Passwords do not match", 400);
    }

    // Find user
    const user = await findUserByEmailSilently(email, platform);

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
        status: UserStatus.ACTIVE,
    });

    return {
        message: "Password set successfully. You can now login.",
    };
};

/**
 * Login service
 * Authenticates user with email and password
 */
export const loginService = async (data: LoginUserRequestData): Promise<LoginResponse> => {
    const { email, password, platform } = data;
    const normalizedEmail = email.toLowerCase();

    // Find active user
    const user = await findUserByEmailSilently(normalizedEmail, platform);

    if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AppError(ErrorMessages.InvalidEmailOrPassword, 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        throw new AppError("Email not verified. Please verify your email before logging in.", 401);
    }

    // Check if user has password set (for email signup users)
    if (!user.password) {
        throw new AppError("Password not set. Please complete the signup process.", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError(ErrorMessages.InvalidEmailOrPassword, 401);
    }

    // Generate JWT token
    const token = createJWTToken(
        {
            userId: user._id,
            email: user.email,
            platform: user.platform,
        },
        AccessTokenExpiry
    );

    return {
        email: user.email,
        role: null,
        expiresIn: AccessTokenExpiryInSeconds,
        token,
    };
};
