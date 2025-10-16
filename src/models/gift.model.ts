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

export const GiftWithTranslationsSchema = GiftSchema.extend({
  translations: z.array(GiftTranslationsSchema),
});

export const GiftListItemSchema = GiftSchema.merge(
  GiftTranslationsSchema.pick({ name: true, lang: true, description: true })
);

export const GetGiftsQuerySchema = PaginationLangQuerySchema;

export const GetGiftByIdQuerySchema = LangQuerySchema;

//Admin ==============================

//list item
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
//post purchase gift
export const PurchaseGiftBodySchema = z.object({
  giftId: z.string(),
  quantity: z.number().min(1).default(1),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.SYSTEM),
  notes: z.string().max(500).optional(),
});

//get my purchased gifts
const GetMyPurchasedGiftItemSchema = GiftListItemSchema.extend({
  quantity: z.number().min(1).default(1),
});
export const GetMyPurchasedGiftsResSchema = z.object({
  data: z.object({
    items: z.array(GetMyPurchasedGiftItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//get my purchased gifts history all and detail
export const MyPurchasedGiftHistorySchema = z.object({
  transactionId: z.string(),
  lang: z.string().max(2),
  giftName: z.string().max(100),
  giftIconUrl: z.string().max(500),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  status: z.string().max(100),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.SYSTEM),
  createdAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  notes: z.string().max(500).optional(),
});

export const GetMyPurchasedGiftHistoryResSchema = z.object({
  data: z.object({
    items: z.array(MyPurchasedGiftHistorySchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const GetMyPurchasedGiftHistoryByIdResSchema = z.object({
  data: MyPurchasedGiftHistorySchema,
  message: z.string(),
});

// post present gift to user
export const PresentGiftBodySchema = z.object({
  receiverId: z.string(),
  giftId: z.string(),
  quantity: z.number().min(1).default(1),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
});

// get my sent/received gifts
const GetMySentGiftItemSchema = z.object({
  presentationId: z.string(),
  lang: z.string().max(2),
  receiverName: z.string().max(100),
  giftName: z.string().max(100),
  giftIconUrl: z.string().max(500),
  quantity: z.number().min(1).default(1),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  isRead: z.boolean().default(false),
});

const GetMyReceivedGiftItemSchema = z.object({
  presentationId: z.string(),
  lang: z.string().max(2),
  senderName: z.string().max(100),
  senderAvatarUrl: z.string().max(500).nullable(),
  giftName: z.string().max(100),
  giftIconUrl: z.string().max(500),
  quantity: z.number().min(1).default(1),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  isRead: z.boolean().default(false),
});

export const GetMySentGiftsResSchema = z.object({
  data: z.object({
    items: z.array(GetMySentGiftItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const GetMyReceivedGiftsResSchema = z.object({
  data: z.object({
    items: z.array(GetMyReceivedGiftItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//types
export type GiftType = z.infer<typeof GiftSchema>;
export type GiftTranslationsType = z.infer<typeof GiftTranslationsSchema>;
export type GiftWithTranslationsType = z.infer<
  typeof GiftWithTranslationsSchema
>;
export type GiftListItemType = z.infer<typeof GiftListItemSchema>;
export type GetGiftsQueryType = z.infer<typeof GetGiftsQuerySchema>;
export type GetGiftByIdQueryType = z.infer<typeof GetGiftByIdQuerySchema>;
export type GetGiftsResType = z.infer<typeof GetGiftsResSchema>;
export type GetGiftByIdBodyType = z.infer<typeof GetGiftByIdBodySchema>;
export type GetGiftByIdResType = z.infer<typeof GetGiftByIdResSchema>;
export type CreateGiftBodyType = z.infer<typeof CreateGiftBodySchema>;
export type UpdateGiftBodyType = z.infer<typeof UpdateGiftBodySchema>;
export type PurchaseGiftBodyType = z.infer<typeof PurchaseGiftBodySchema>;
export type GetMyPurchasedGiftsResType = z.infer<
  typeof GetMyPurchasedGiftsResSchema
>;
export type MyPurchasedGiftHistoryType = z.infer<
  typeof MyPurchasedGiftHistorySchema
>;
export type GetMyPurchasedGiftHistoryResType = z.infer<
  typeof GetMyPurchasedGiftHistoryResSchema
>;
export type GetMyPurchasedGiftHistoryByIdResType = z.infer<
  typeof GetMyPurchasedGiftHistoryByIdResSchema
>;
export type PresentGiftBodyType = z.infer<typeof PresentGiftBodySchema>;
export type GetMySentGiftItemType = z.infer<typeof GetMySentGiftItemSchema>;
export type GetMyReceivedGiftItemType = z.infer<
  typeof GetMyReceivedGiftItemSchema
>;
export type GetMySentGiftsResType = z.infer<typeof GetMySentGiftsResSchema>;
export type GetMyReceivedGiftsResType = z.infer<
  typeof GetMyReceivedGiftsResSchema
>;
