import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

export const initializeEmailService = async () => {
  // Using Gmail SMTP or your preferred email service
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    await initializeEmailService();
  }

  try {
    await transporter!.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderData: {
    orderId: string;
    cafeeName: string;
    productName: string;
    amount: number;
  }
): Promise<void> => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <ul>
      <li><strong>Order ID:</strong> ${orderData.orderId}</li>
      <li><strong>Cafe:</strong> ${orderData.cafeeName}</li>
      <li><strong>Product:</strong> ${orderData.productName}</li>
      <li><strong>Amount:</strong> ₹${orderData.amount}</li>
    </ul>
    <p>We'll notify you once your order is shipped.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Order Confirmation",
    html,
  });
};

export const sendPaymentSuccessEmail = async (
  email: string,
  orderData: {
    orderId: string;
    amount: number;
  }
): Promise<void> => {
  const html = `
    <h2>Payment Successful</h2>
    <p>Your payment has been received!</p>
    <ul>
      <li><strong>Order ID:</strong> ${orderData.orderId}</li>
      <li><strong>Amount:</strong> ₹${orderData.amount}</li>
    </ul>
    <p>Your order is now being processed.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Payment Successful",
    html,
  });
};

export const sendShippingNotificationEmail = async (
  email: string,
  orderData: {
    orderId: string;
    trackingUrl: string;
    trackingNumber?: string;
  }
): Promise<void> => {
  const html = `
    <h2>Your Order Has Been Shipped!</h2>
    <p>Great news! Your order is on its way.</p>
    <ul>
      <li><strong>Order ID:</strong> ${orderData.orderId}</li>
      <li><strong>Tracking Number:</strong> ${orderData.trackingNumber || "N/A"}</li>
    </ul>
    <p><a href="${orderData.trackingUrl}">Track your order</a></p>
  `;

  await sendEmail({
    to: email,
    subject: "Your Order Has Been Shipped",
    html,
  });
};
