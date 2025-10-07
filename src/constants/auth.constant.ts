export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export const TypeOfVerificationCode = {
  REGISTER: "0",
  FORGOT_PASSWORD: "1",
  LOGIN: "2",
  DISABLE_2FA: "3",
  WITHDRAW_MONEY: "4",
} as const;

export type TypeOfVerificationCodeType =
  (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];
