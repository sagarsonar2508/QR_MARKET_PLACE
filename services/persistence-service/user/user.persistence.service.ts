import { ErrorMessages, type Platform } from "../../dto-service/constants/modules.export";
import { UserStatus } from "../../dto-service/modules.export";
import { AppError } from "../../helper-service/AppError";
import { UserModel, type UserDetails, type AuthProvider } from "./schemas/modules.export";

export const findActiveUser = async (email: string, platform: Platform): Promise<UserDetails> => {
  const userDetails = await UserModel.findOne({
    email: email.toLowerCase(),
    platform: platform.toLowerCase(),
    status: UserStatus.ACTIVE,
  });

  if (!userDetails) {
    throw new AppError(ErrorMessages.UserNotFound, 404);
  }
  return userDetails;
};

export const findUserByEmailSilently = async (email: string, platform: Platform): Promise<UserDetails | null> => {
  return await UserModel.findOne({
    email: email.toLowerCase(),
    platform: platform.toLowerCase(),
  });
};

export const findUserByGoogleId = async (googleId: string): Promise<UserDetails | null> => {
  return await UserModel.findOne({ googleId });
};

export const findUserByVerificationToken = async (token: string): Promise<UserDetails | null> => {
  const now = new Date();
  const user = await UserModel.findOne({
    verificationToken: token,
  });

  // Check if token exists and hasn't expired
  if (!user) {
    return null;
  }

  // If no expiry date set, token is invalid
  if (!user.verificationTokenExpiry) {
    return null;
  }

  // If token has expired, return null
  if (user.verificationTokenExpiry < now) {
    return null;
  }

  return user;
};

export const createUser = async (userData: Partial<UserDetails>): Promise<UserDetails> => {
  const user = new UserModel(userData);
  return await user.save();
};

export const updateUser = async (userId: string, updates: Partial<UserDetails>): Promise<UserDetails | null> => {
  return await UserModel.findByIdAndUpdate(userId, updates, { new: true });
};
