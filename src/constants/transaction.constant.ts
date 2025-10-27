export const TransactionTypeEnum = {
  Deposit: "Deposit",
  Purchase: "Purchase",
  Refund: "Refund",
  Withdraw: "Withdraw",
  Gift: "Gift",
  Adjustment: "Adjustment",
  AutoRenew: "AutoRenew",
} as const;

export type TransactionEnumType =
  (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum];

export const TransactionStatus = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
  Cancelled: "Cancelled",
} as const;

export type TransactionStatusType =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionMethod = {
  System: "System",
  CreditCard: "CreditCard",
} as const;

export type TransactionMethodType =
  (typeof TransactionMethod)[keyof typeof TransactionMethod];
