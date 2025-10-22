import z from "zod";

import { FeatureTypeEnum, LimitTypeEnum, PlanTypeEnum } from "@/constants";
import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

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
  featureName: z.string().min(3).max(100),
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

//FOR USER =================================================================

export const UserSubscriptionSchema = z.object({
  id: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  active: z.boolean(),
  userId: z.string(),
  subscriptionId: z.string(),
  cancellationReason: z.string().max(1000).optional(),
  cancelledAt: z.iso.datetime().optional(),
  planType: z.enum(PlanTypeEnum),
});

const SubscriptionPlanItemSchema = SubscriptionSchema.merge(
  SubscriptionTranslationsSchema.pick({
    name: true,
    lang: true,
    description: true,
  })
).extend({
  features: z
    .array(
      z.object({
        featureType: z.enum(FeatureTypeEnum),
        featureName: z.string().min(3).max(100),
        limitValue: z.number().min(0).default(0),
        limitType: z.enum(LimitTypeEnum),
        isEnabled: z.boolean().default(true),
      })
    )
    .default([]),
});

//GET ALL plans
export const GetSubscriptionPlansResSchema = z.object({
  data: z.object({
    items: z.array(SubscriptionPlanItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//GET current plan / usage
const GetUserSubscriptionItemSchema = z.object({
  featureType: z.enum(FeatureTypeEnum),
  featureName: z.string().min(3).max(100),
  usageCount: z.number().min(0),
  limitValue: z.number().min(0),
  limitType: z.enum(LimitTypeEnum),
  isUnlimited: z.boolean().default(false),
  lastUsedAt: z.iso.datetime().optional(),
  resetAt: z.iso.datetime().optional(),
  canUse: z.boolean().default(true),
});

// current
export const GetCurrentSubscriptionResSchema = z.object({
  data: z.object({
    id: z.string(),
    planType: z.enum(PlanTypeEnum),
    planName: z.string().optional(),
    startAt: z.iso.datetime(),
    endAt: z.iso.datetime(),
    active: z.boolean().default(true),
    autoRenew: z.boolean().default(false),
    daysRemaining: z.number().min(0).default(0),
    featureUsages: z.array(GetUserSubscriptionItemSchema).default([]),
  }),
  message: z.string(),
});

//usage
export const GetUsageSubscriptionResSchema = z.object({
  data: z.object({
    items: z.array(GetUserSubscriptionItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//POST subscribe
export const SubscribeBodySchema = z.object({
  subscriptionPlanId: z.string(),
  autoRenew: z.boolean().default(true),
});

//POST cancel
export const CancelSubscriptionBodySchema = z.object({
  reason: z.string().max(1000).optional(),
});

//PUT AUTO RENEW
export const UpdateAutoRenewBodySchema = SubscribeBodySchema.pick({
  autoRenew: true,
});

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
export type GetSubscriptionPlansResType = z.infer<
  typeof GetSubscriptionPlansResSchema
>;
export type GetCurrentSubscriptionResType = z.infer<
  typeof GetCurrentSubscriptionResSchema
>;
export type GetUsageSubscriptionResType = z.infer<
  typeof GetUsageSubscriptionResSchema
>;
export type SubscribeBodyType = z.infer<typeof SubscribeBodySchema>;
export type CancelSubscriptionBodyType = z.infer<
  typeof CancelSubscriptionBodySchema
>;
export type UpdateAutoRenewBodyType = z.infer<typeof UpdateAutoRenewBodySchema>;
export type SubscriptionPlanItemType = z.infer<
  typeof SubscriptionPlanItemSchema
>;
