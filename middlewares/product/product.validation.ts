import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  basePrice: Joi.number().required().min(0),
  printProviderId: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  basePrice: Joi.number().optional().min(0),
  printProviderId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
