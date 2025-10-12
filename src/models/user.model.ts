import z from "zod";

import { Gender, MeritLevel } from "@/constants";

export const UserSchema = z.object({
  id: z.number(),
  mail: z.email().nonempty().max(100),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100).nonempty(),
  avatarUrl: z.string().nullable(),
  meritLevel: z.enum(Object.values(MeritLevel)),
  gender: z.enum(Object.values(Gender)).nullable(),
  experiencePoints: z.number().min(0).default(0),
  autoRenewSubscription: z.boolean().default(false),
  totp: z.string().nullable(),
  streakDays: z.number().min(0).default(0),
  isNew: z.boolean().default(true),
  role: z.string(),
  introduction: z.string().max(500).nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastLoginAt: z.iso.datetime(),
});

//auth/me
export const GetUserProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true,
    totp: true,
    autoRenewSubscription: true,
  }),
});

//PUT /users/me
export const UpdateMeBodySchema = UserSchema.pick({
  name: true,
  introduction: true,
  gender: true,
  avatarUrl: true,
});

// PUT /users/profile-setup first time setup when register
export const SetupProfileBodySchema = z.object({
  learningLanguageIds: z.array(z.number()).min(1),
  speakingLanguageIds: z.array(z.number()).min(1),
  interestIds: z.array(z.number()).min(1),
});

// PUT /users/profile/me update profile
export const UpdateProfileBodySchema = SetupProfileBodySchema;

// PUT /users/set-restrictions
export const SetRestrictionsBodySchema = UserSchema.pick({
  meritLevel: true,
});

//types
export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>;
export type SetupProfileBodyType = z.infer<typeof SetupProfileBodySchema>;
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>;
export type SetRestrictionsBodyType = z.infer<typeof SetRestrictionsBodySchema>;
