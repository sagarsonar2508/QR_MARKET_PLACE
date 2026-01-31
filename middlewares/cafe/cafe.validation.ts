import Joi from "joi";

export const createCafeSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  address: Joi.string().required().trim().min(5).max(200),
  city: Joi.string().required().trim().min(2).max(50),
  googleReviewLink: Joi.string().optional().uri(),
});

export const updateCafeSchema = Joi.object({
  name: Joi.string().optional().trim().min(2).max(100),
  address: Joi.string().optional().trim().min(5).max(200),
  city: Joi.string().optional().trim().min(2).max(50),
  googleReviewLink: Joi.string().optional().uri(),
  status: Joi.string().optional().valid("ACTIVE", "INACTIVE", "SUSPENDED"),
});
