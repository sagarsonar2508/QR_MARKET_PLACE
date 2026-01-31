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

export const createUser = async (userData: Partial<UserDetails>): Promise<UserDetails> => {
  const user = new UserModel(userData);
  return await user.save();
};

export const updateUser = async (userId: string, updates: Partial<UserDetails>): Promise<UserDetails | null> => {
  return await UserModel.findByIdAndUpdate(userId, updates, { new: true });
};
