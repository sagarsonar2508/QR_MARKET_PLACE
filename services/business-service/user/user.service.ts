import type { LoginUserRequestData, LoginResponse } from "../../dto-service/modules.export";
import type { SessionMetadata } from "../../dto-service/modules.export";

interface LoginResponseWithSession extends LoginResponse {
  sessionId?: number;
}

export const userLoginService = async (
  data: LoginUserRequestData,
  metadata?: SessionMetadata
): Promise<LoginResponseWithSession> => {
  // TODO: Implement login logic
  throw new Error("Not implemented");
};