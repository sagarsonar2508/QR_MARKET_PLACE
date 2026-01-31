import Joi from "joi";

export const initiatePaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().required().min(0),
  provider: Joi.string().required().valid("RAZORPAY", "STRIPE"),
});

export const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentId: Joi.string().required(),
  signature: Joi.string().optional(),
});
