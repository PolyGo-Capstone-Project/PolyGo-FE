export const EMPTY_ICON = "—";
export const FALLBACK_FLAG = "🏳️";

export const PaymentMethod = {
  SYSTEM: "System",
  STRIPE: "Stripe",
  PAYPAL: "Paypal",
} as const;

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];
