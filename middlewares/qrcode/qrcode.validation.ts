import Joi from "joi";

export const createQRCodeSchema = Joi.object({
  type: Joi.string().required().valid("GOOGLE_REVIEW", "CUSTOM_URL", "PRODUCT_LINK"),
  destinationUrl: Joi.string().required().uri(),
  expiresAt: Joi.date().optional().greater("now"),
});

export const updateQRCodeSchema = Joi.object({
  destinationUrl: Joi.string().optional().uri(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().optional(),
});

export const rotateLinkSchema = Joi.object({
  destinationUrl: Joi.string().required().uri(),
});
