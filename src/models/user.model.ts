import z from "zod";

import { UserStatus } from "@/constants";

export const UserSchema = z.object({
  id: z.number(),
  mail: z.email().nonempty().max(100),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100).nonempty(),
  phoneNumber: z.string().min(9).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const GetUserProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true,
    totpSecret: true,
  }),
});

export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
