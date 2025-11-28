// src/models/level.model.ts
import z from "zod";

import {
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

/* ====== Schemas ====== */

export const LevelSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  order: z.number().int(),
  requiredXP: z.number().int(),
  description: z.string().max(500),
});

// level của user (có thêm isClaimed)
export const UserLevelSchema = LevelSchema.extend({
  isClaimed: z.boolean(),
});

// Query: giống badge – dùng pagination + lang
export const GetLevelsQuerySchema = PaginationLangQuerySchema;

// GET /levels
export const GetLevelsResSchema = z.object({
  data: z.object({
    items: z.array(LevelSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET /levels/me
export const GetUserLevelsResSchema = z.object({
  data: z.object({
    items: z.array(UserLevelSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

/* ====== Types ====== */

export type LevelType = z.infer<typeof LevelSchema>;
export type UserLevelType = z.infer<typeof UserLevelSchema>;
export type GetLevelsQueryType = z.infer<typeof GetLevelsQuerySchema>;
export type GetLevelsResType = z.infer<typeof GetLevelsResSchema>;
export type GetUserLevelsResType = z.infer<typeof GetUserLevelsResSchema>;
