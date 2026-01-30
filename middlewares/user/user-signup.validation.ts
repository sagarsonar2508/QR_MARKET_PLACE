import Joi from "joi";
import type { EmailSignupRequestData, GoogleSignupRequestData, VerifyEmailRequestData, SetPasswordRequestData } from "../../services/dto-service/modules.export";
import { Platform } from "../../services/dto-service/constants/modules.export";
const platformValues = Object.values(Platform) as string[];

export const emailSignupSchema = Joi.object<EmailSignupRequestData>({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  platform: Joi.string()
    .valid(...platformValues)
    .required(),
});

export const googleSignupSchema = Joi.object<GoogleSignupRequestData>({
  googleToken: Joi.string().required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  platform: Joi.string()
    .valid(...platformValues)
    .required(),
});

export const verifyEmailSchema = Joi.object<VerifyEmailRequestData>({
  token: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const setPasswordSchema = Joi.object<SetPasswordRequestData>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});
