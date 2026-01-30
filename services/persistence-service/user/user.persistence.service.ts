import { ErrorMessages, type Platform } from "../../dto-service/constants/modules.export";
import { UserStatus, type UserRoles } from "../../dto-service/modules.export";
import { AppError } from "../../helper-service/AppError";
import { UserModel, type UserDetails } from "./schemas/modules.export";

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
