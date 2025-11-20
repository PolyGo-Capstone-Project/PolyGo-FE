export const TypeOfVerificationCode = {
  Register: "Register",
  Forgot_password: "Forgot_password",
  Login: "Login",
  Disble_2FA: "Disble_2FA",
  Withdraw_money: "Withdraw_money",
} as const;

export type TypeOfVerificationCodeType =
  (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];
