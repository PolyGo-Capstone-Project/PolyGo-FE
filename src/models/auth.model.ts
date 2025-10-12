import z from "zod";

import { TypeOfVerificationCode } from "@/constants";
import { UserSchema } from "@/models/user.model";

// Password validation regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const LoginBodySchema = UserSchema.pick({
  mail: true,
})
  .extend({
    // Custom password validation for login
    password: z.string().min(6).max(100).regex(passwordRegex),
    totpCode: z.string().length(6).optional(), // 2FA code
    code: z.string().length(6).optional(), // Mail OTP code
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    // Nếu mà truyền cùng lúc totpCode và code thì sẽ add issue
    const message =
      "Bạn chỉ nên truyền mã xác thực 2FA hoặc mã OTP. Không được truyền cả 2";
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        path: ["totpCode"],
        message,
        code: "custom",
      });
      ctx.addIssue({
        path: ["code"],
        message,
        code: "custom",
      });
    }
  });

export const LoginResSchema = z.object({
  data: z.string(), // JWT token
  message: z.string(),
});

export const GetAuthorizationUrlResSchema = z.object({
  url: z.url(),
});

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  mail: true,
})
  .extend({
    password: z.string().min(6).max(100).regex(passwordRegex),
    confirmPassword: z.string().min(6).max(100).regex(passwordRegex),
    otp: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Password and confirm password must match",
        path: ["confirmPassword"],
      });
    }
  });

//otp
export const VerificationCodeSchema = z.object({
  id: z.number(),
  mail: z.email(),
  code: z.string().length(6),
  verificationType: z.enum([
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
    TypeOfVerificationCode.WITHDRAW_MONEY,
  ]),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  mail: true,
  verificationType: true,
}).strict();

export const ForgotPasswordBodySchema = z
  .object({
    mail: z.email(),
    otp: z.string().length(6),
    password: z.string().min(6).max(100).regex(passwordRegex),
    confirmNewPassword: z.string().min(6).max(100).regex(passwordRegex),
  })
  .strict()
  .superRefine(({ confirmNewPassword, password }, ctx) => {
    if (confirmNewPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu và mật khẩu xác nhận phải giống nhau",
        path: ["confirmNewPassword"],
      });
    }
  });

//change password
export const ChangePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(6).max(100).regex(passwordRegex),
    newPassword: z.string().min(6).max(100).regex(passwordRegex),
    confirmPassword: z.string().min(6).max(100).regex(passwordRegex),
  })
  .strict()
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu mới và mật khẩu xác nhận phải giống nhau",
        path: ["confirmNewPassword"],
      });
    }
  });

//types
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type LoginResType = z.infer<typeof LoginResSchema>;
export type GetAuthorizationUrlResType = z.infer<
  typeof GetAuthorizationUrlResSchema
>;
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>;
