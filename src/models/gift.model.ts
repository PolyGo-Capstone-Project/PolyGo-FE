import z from "zod";

import { PaymentMethod } from "@/constants";
import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

export const GiftSchema = z.object({
  id: z.string(),
  price: z.number().min(0).default(0),
  iconUrl: z.string().optional(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),
});

export const GiftTranslationsSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  giftId: z.string(),
});

//Admin ==============================

//list item
export const GiftListItemSchema = GiftSchema.merge(
  GiftTranslationsSchema.pick({ name: true, lang: true, description: true })
);

export const GetGiftsQuerySchema = PaginationLangQuerySchema;

export const GetGiftByIdQuerySchema = LangQuerySchema;

//GET ALL
export const GetGiftsResSchema = z.object({
  data: z.object({
    items: z.array(GiftListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Get
export const GetGiftByIdBodySchema = GiftSchema.pick({ id: true });

export const GetGiftByIdResSchema = z.object({
  data: GiftListItemSchema,
  message: z.string(),
});

//POST
export const CreateGiftBodySchema = GiftSchema.pick({
  price: true,
  iconUrl: true,
}).merge(
  GiftTranslationsSchema.pick({ lang: true, name: true, description: true })
);

//PUT for update and add translation
export const UpdateGiftBodySchema = CreateGiftBodySchema;
//=====================================

//for user
//get my gifts
export const GetMyGiftsResSchema = GetGiftsResSchema;

//post purchase gift
export const PurchaseGiftBodySchema = z.object({
  giftId: z.string(),
  quantity: z.number().min(1).default(1),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.SYSTEM),
  notes: z.string().max(500).optional(),
});

// SOON

//types
export type GiftType = z.infer<typeof GiftSchema>;
export type GiftTranslationsType = z.infer<typeof GiftTranslationsSchema>;
export type GiftListItemType = z.infer<typeof GiftListItemSchema>;
export type GetGiftsQueryType = z.infer<typeof GetGiftsQuerySchema>;
export type GetGiftByIdQueryType = z.infer<typeof GetGiftByIdQuerySchema>;
export type GetGiftsResType = z.infer<typeof GetGiftsResSchema>;
export type GetGiftByIdBodyType = z.infer<typeof GetGiftByIdBodySchema>;
export type GetGiftByIdResType = z.infer<typeof GetGiftByIdResSchema>;
export type CreateGiftBodyType = z.infer<typeof CreateGiftBodySchema>;
export type UpdateGiftBodyType = z.infer<typeof UpdateGiftBodySchema>;
export type PurchaseGiftBodyType = z.infer<typeof PurchaseGiftBodySchema>;
