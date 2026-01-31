import Joi from "joi";

export const createOrderSchema = Joi.object({
  cafeId: Joi.string().required(),
  productId: Joi.string().required(),
  qrCodeId: Joi.string().required(),
  quantity: Joi.number().optional().min(1),
});
