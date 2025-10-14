import z from "zod";

import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

export const PlanTypeEnum = {
  FREE: "Free",
  PLUS: "Plus",
  PREMIUM: "Premium",
} as const;

export const FeatureTypeEnum = {
  CHAT: "Chat",
  TRANSLATION: "Translation",
  VOICECALL: "VoiceCall",
  VIDEOCALL: "VideoCall",
  EVENTPARTICIPATION: "EventParticipation",
  EVENTCREATION: "EventCreation",
  PREMIUMBADGES: "PremiumBadges",
  ANALYTICS: "Analytics",
  PRIORITYSUPPORT: "PrioritySupport",
  ADVANCEDMATCHING: "AdvancedMatching",
} as const;

export const LimitTypeEnum = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  UNLIMITED: "Unlimited",
} as const;

export const SubscriptionSchema = z.object({
  id: z.string(),
  price: z.number().min(0).default(0),
  durationInDays: z.number().min(1).default(30),
  isActive: z.boolean().default(true),
  planType: z.enum(PlanTypeEnum),
});

export const SubscriptionTranslationsSchema = z.object({
  id: z.string(),
  lang: z.string().max(2).default("en"),
  name: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  subscriptionId: z.string(),
});

export const SubscriptionFeatureSchema = z.object({
  id: z.string(),
  featureType: z.enum(FeatureTypeEnum),
  limitValue: z.number().min(0).default(0),
  limitType: z.enum(LimitTypeEnum),
  isEnable: z.boolean().default(true),
  subscriptionId: z.string(),
});

// =========================== FOR ADMIN ===========================

//list item
export const SubscriptionListItemSchema = SubscriptionSchema.merge(
  SubscriptionTranslationsSchema.pick({
    name: true,
    lang: true,
    description: true,
  })
).extend({
  features: z.array(SubscriptionFeatureSchema).default([]),
});

export const GetSubscriptionsQuerySchema = PaginationLangQuerySchema;

export const GetSubscriptionByIdQuerySchema = LangQuerySchema;

//GET ALL
export const GetSubscriptionsResSchema = z.object({
  data: z.object({
    items: z.array(SubscriptionListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Get
export const GetSubscriptionByIdBodySchema = SubscriptionSchema.pick({
  id: true,
});

export const GetSubscriptionByIdResSchema = z.object({
  data: SubscriptionListItemSchema,
  message: z.string(),
});

//POST
export const CreateSubscriptionBodySchema = SubscriptionSchema.pick({
  price: true,
  durationInDays: true,
  isActive: true,
  planType: true,
}).extend({
  translations: z
    .array(
      SubscriptionTranslationsSchema.pick({
        name: true,
        lang: true,
        description: true,
      })
    )
    .default([]),
  features: z
    .array(
      SubscriptionFeatureSchema.pick({
        featureType: true,
        limitValue: true,
        limitType: true,
        isEnable: true,
      })
    )
    .default([]),
});

//PUT for update and add translation
export const UpdateSubscriptionBodySchema = CreateSubscriptionBodySchema;

// =================================================================

//types
export type SubscriptionType = z.infer<typeof SubscriptionSchema>;
export type SubscriptionTranslationsType = z.infer<
  typeof SubscriptionTranslationsSchema
>;
export type SubscriptionFeatureType = z.infer<typeof SubscriptionFeatureSchema>;
export type SubscriptionListItemType = z.infer<
  typeof SubscriptionListItemSchema
>;
export type GetSubscriptionsQueryType = z.infer<
  typeof GetSubscriptionsQuerySchema
>;
export type GetSubscriptionByIdQueryType = z.infer<
  typeof GetSubscriptionByIdQuerySchema
>;
export type GetSubscriptionsResType = z.infer<typeof GetSubscriptionsResSchema>;
export type GetSubscriptionByIdBodyType = z.infer<
  typeof GetSubscriptionByIdBodySchema
>;
export type GetSubscriptionByIdResType = z.infer<
  typeof GetSubscriptionByIdResSchema
>;
export type CreateSubscriptionBodyType = z.infer<
  typeof CreateSubscriptionBodySchema
>;
export type UpdateSubscriptionBodyType = z.infer<
  typeof UpdateSubscriptionBodySchema
>;
