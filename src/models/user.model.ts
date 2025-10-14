import z from "zod";

import { Gender, MeritLevel } from "@/constants";
import {
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

export const UserSchema = z.object({
  id: z.string(),
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
  balance: z.number().min(0).default(0),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastLoginAt: z.iso.datetime(),
});

// =================== for your self
//auth/me
export const GetUserProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true,
    totp: true,
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
  learningLanguageIds: z.array(z.string()).min(1),
  speakingLanguageIds: z.array(z.string()).min(1),
  interestIds: z.array(z.string()).min(1),
});

// PUT /users/profile/me update profile
export const UpdateProfileBodySchema = SetupProfileBodySchema;

// ADMIN ==============

// PUT /users/set-restriction
export const SetRestrictionsBodySchema = z.object({
  id: z.string(),
  meritLevel: z.enum(Object.values(MeritLevel) as [string, ...string[]]),
});

// Get All Users
export const UserListItemSchema = UserSchema.pick({
  id: true,
  name: true,
  mail: true,
  avatarUrl: true,
  meritLevel: true,
  role: true,
  gender: true,
  experiencePoints: true,
  autoRenewSubscription: true,
  streakDays: true,
  isNew: true,
  balance: true,
  lastLoginAt: true,
});

export const GetUsersQuerySchema = PaginationLangQuerySchema.omit({
  lang: true,
});

export const GetUsersResSchema = z.object({
  data: z.object({
    items: z.array(UserListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const GetUserByIdBodySchema = UserSchema.pick({ id: true });

export const GetUserByIdResSchema = z.object({
  data: UserListItemSchema,
  message: z.string(),
});

// ===================
// FOR USER not admin
// matching
export const GetUsersMatchingQuerySchema = GetUsersQuerySchema;
export const GetUserByMatchingResSchema = GetUsersResSchema;

//types
export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>;
export type SetupProfileBodyType = z.infer<typeof SetupProfileBodySchema>;
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>;
export type SetRestrictionsBodyType = z.infer<typeof SetRestrictionsBodySchema>;
export type UserListItemType = z.infer<typeof UserListItemSchema>;
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>;
export type GetUsersResType = z.infer<typeof GetUsersResSchema>;
export type GetUserByIdBodyType = z.infer<typeof GetUserByIdBodySchema>;
export type GetUserByIdResType = z.infer<typeof GetUserByIdResSchema>;

export type GetUsersMatchingQueryType = z.infer<
  typeof GetUsersMatchingQuerySchema
>;
export type GetUserByMatchingResType = z.infer<
  typeof GetUserByMatchingResSchema
>;
