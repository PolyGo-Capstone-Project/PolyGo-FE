import z from "zod";

import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

export const BadgeCategory = {
  ACCOUNT: "Account",
  COMMERCE: "Commerce",
  SOCIAL: "Social",
  EVENT: "Event",
  PROGRESSION: "Progression",
  EXPLORATION: "Exploration",
} as const;

export type BadgeCategory = (typeof BadgeCategory)[keyof typeof BadgeCategory];

//badge and its translations
export const BadgeSchema = z.object({
  id: z.string(),
  code: z.string(),
  iconUrl: z.string().optional(),
  badgeCategory: z.enum(BadgeCategory),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),
});

export const BadgeTranslationsSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  name: z.string().max(200),
  description: z.string().max(500).optional(),
  badgeId: z.string(),
});

//ADMIN ==============================

export const BadgeListItemSchema = BadgeSchema.merge(
  BadgeTranslationsSchema.pick({ name: true, lang: true, description: true })
);

export const GetBadgesQuerySchema = PaginationLangQuerySchema;

export const GetBadgeByIdQuerySchema = LangQuerySchema;

//GET ALL
export const GetBadgesResSchema = z.object({
  data: z.object({
    items: z.array(BadgeListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Get
export const GetBadgeByIdBodySchema = BadgeSchema.pick({ id: true });

export const GetBadgeByIdResSchema = z.object({
  data: BadgeListItemSchema,
  message: z.string(),
});

//POST
export const CreateBadgeBodySchema = BadgeSchema.pick({
  code: true,
  iconUrl: true,
  badgeCategory: true,
}).merge(
  BadgeTranslationsSchema.pick({ lang: true, name: true, description: true })
);

//PUT for update and add translation
export const UpdateBadgeBodySchema = CreateBadgeBodySchema;

//USER ==============================
export const UserBadgeResSchema = GetBadgesResSchema;

//types
export type BadgeType = z.infer<typeof BadgeSchema>;
export type BadgeTranslationsType = z.infer<typeof BadgeTranslationsSchema>;
export type BadgeListItemType = z.infer<typeof BadgeListItemSchema>;
export type GetBadgesQueryType = z.infer<typeof GetBadgesQuerySchema>;
export type GetBadgeByIdQueryType = z.infer<typeof GetBadgeByIdQuerySchema>;
export type GetBadgesResType = z.infer<typeof GetBadgesResSchema>;
export type GetBadgeByIdResType = z.infer<typeof GetBadgeByIdResSchema>;
export type CreateBadgeBodyType = z.infer<typeof CreateBadgeBodySchema>;
export type UpdateBadgeBodyType = z.infer<typeof UpdateBadgeBodySchema>;
export type UserBadgeResType = z.infer<typeof UserBadgeResSchema>;
