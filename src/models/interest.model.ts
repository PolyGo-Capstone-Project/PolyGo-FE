import z from "zod";

import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

//schema
export const InterestSchema = z.object({
  id: z.string(),
  iconUrl: z.string().optional(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),
});

export const InterestTranslationSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  name: z.string().max(500),
  description: z.string().max(1000),
  interestId: z.string(),
});

//GET ALL
export const InterestListItemSchema = InterestSchema.merge(
  InterestTranslationSchema.pick({ lang: true, name: true, description: true })
);

export const GetInterestsQuerySchema = PaginationLangQuerySchema;

export const GetInterestsResSchema = z.object({
  data: z.object({
    items: z.array(InterestListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Get One
export const GetInterestByIdQuerySchema = LangQuerySchema;

export const GetInterestByIdBodySchema = InterestSchema.pick({ id: true });

export const GetInterestByIdResSchema = z.object({
  data: InterestListItemSchema,
  message: z.string(),
});

//POST
export const CreateInterestBodySchema = InterestSchema.pick({
  iconUrl: true,
}).merge(
  InterestTranslationSchema.pick({ lang: true, name: true, description: true })
);

//PUT
export const UpdateInterestBodySchema = CreateInterestBodySchema;

//types
export type InterestType = z.infer<typeof InterestSchema>;
export type InterestTranslationType = z.infer<typeof InterestTranslationSchema>;
export type InterestListItemType = z.infer<typeof InterestListItemSchema>;
export type GetInterestsQueryType = z.infer<typeof GetInterestsQuerySchema>;
export type GetInterestsResType = z.infer<typeof GetInterestsResSchema>;
export type GetInterestByIdQueryType = z.infer<
  typeof GetInterestByIdQuerySchema
>;
export type GetInterestByIdBodyType = z.infer<typeof GetInterestByIdBodySchema>;
export type GetInterestByIdResType = z.infer<typeof GetInterestByIdResSchema>;
export type CreateInterestBodyType = z.infer<typeof CreateInterestBodySchema>;
export type UpdateInterestBodyType = z.infer<typeof UpdateInterestBodySchema>;
