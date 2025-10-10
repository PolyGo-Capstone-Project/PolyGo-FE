import z from "zod";

import { UserStatus } from "@/constants";

export const UserSchema = z.object({
  id: z.number(),
  mail: z.email().nonempty().max(100),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100).nonempty(),
  avatarUrl: z.string().nullable(),
  gender: z.enum(["male", "female", "other"]).nullable(),
  experiencePoints: z.number().min(0).default(0),
  autoRenewSubscription: z.boolean().default(false),
  totp: z.string().nullable(),
  isNew: z.boolean().default(true),
  role: z.string(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

//auth/me
export const GetUserProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true,
    totp: true,
    autoRenewSubscription: true,
  }),
});

export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
