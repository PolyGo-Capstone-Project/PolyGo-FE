export const TransactionTypeEnum = {
  Deposit: "Deposit",
  Purchase: "Purchase",
  Refund: "Refund",
  Withdraw: "Withdraw",
  Adjustment: "Adjustment",
  AutoRenew: "AutoRenew",
} as const;

export type TransactionEnumType =
  (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum];

export const TransactionStatus = {
  Pending: "Pending",
  Completed: "Completed",
  Expired: "Expired",
  Cancelled: "Cancelled",
} as const;

export type TransactionStatusType =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionMethod = {
  System: "System",
  Wallet: "Wallet",
  QRPayment: "QRPayment",
} as const;

export type TransactionMethodType =
  (typeof TransactionMethod)[keyof typeof TransactionMethod];
