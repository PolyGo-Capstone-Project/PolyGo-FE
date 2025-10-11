import z from "zod";

import {
  LangQuerySchema,
  LangQueryType,
  PaginationLangQuerySchema,
  PaginationLangQueryType,
  PaginationMetaSchema,
} from "@/models/common.model";

export const LanguageSchema = z.object({
  id: z.string(),
  code: z.string().max(2),
  iconUrl: z.string().optional(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),
});

export const LanguageTranslationsSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  name: z.string().max(100),
  languageId: z.string().max(2),
});

export const LanguageListItemSchema = LanguageSchema.merge(
  LanguageTranslationsSchema.pick({ name: true, lang: true })
);

export const GetLanguagesQuerySchema = PaginationLangQuerySchema;

export const GetLanguageByIdQuerySchema = LangQuerySchema;

//GET ALL
export const GetLanguagesResSchema = z.object({
  data: z.object({
    items: z.array(LanguageListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Get
export const GetLanguageByIdBodySchema = LanguageSchema.pick({ id: true });

export const GetLanguageByIdResSchema = z.object({
  data: LanguageListItemSchema,
  message: z.string(),
});

//Post
export const CreateLanguageBodySchema = LanguageSchema.pick({
  code: true,
  iconUrl: true,
}).merge(LanguageTranslationsSchema.pick({ lang: true, name: true }));

//put
export const UpdateLanguageBodySchema = CreateLanguageBodySchema;

//types
export type LanguageType = z.infer<typeof LanguageSchema>;
export type LanguageTranslationsType = z.infer<
  typeof LanguageTranslationsSchema
>;
export type LanguageListItemType = z.infer<typeof LanguageListItemSchema>;
export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>;
export type GetLanguageByIdResType = z.infer<typeof GetLanguageByIdResSchema>;
export type GetLanguageByIdBodyType = z.infer<typeof GetLanguageByIdBodySchema>;
export type GetLanguagesQueryType = PaginationLangQueryType;
export type GetLanguageByIdQueryType = LangQueryType;
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;
