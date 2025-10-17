// src/models/subscriptionPlan.model.ts
import z from "zod";

import { FeatureTypeEnum, LimitTypeEnum, PlanTypeEnum } from "@/constants";
import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

/* =========================
   PHẦN 1: Subscription (file đầu)
========================= */

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

// list item
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

// GET ALL
export const GetSubscriptionsResSchema = z.object({
  data: z.object({
    items: z.array(SubscriptionListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// Get
export const GetSubscriptionByIdBodySchema = SubscriptionSchema.pick({
  id: true,
});

export const GetSubscriptionByIdResSchema = z.object({
  data: SubscriptionListItemSchema,
  message: z.string(),
});

// POST
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

// PUT for update and add translation
export const UpdateSubscriptionBodySchema = CreateSubscriptionBodySchema;

// =================================================================
// types (Subscription)
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

/* =========================
   PHẦN 2: Plan + Current/Usage (file dưới)
========================= */

// Feature of a plan
export const PlanFeatureSchema = z.object({
  featureType: z.string(),
  featureName: z.string(),
  limitValue: z.number().nullable().optional(),
  limitType: z.string().nullable().optional(),
  isEnabled: z.boolean(),
});

// Plan item
export const PlanSchema = z.object({
  id: z.string(),
  planType: z.string(),
  lang: z.string().max(2),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  durationInDays: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),
  features: z.array(PlanFeatureSchema),
});

// Response list item and pagination
export const PlanListItemSchema = PlanSchema;

export const GetPlansQuerySchema = PaginationLangQuerySchema;

export const GetPlanByIdQuerySchema = LangQuerySchema;

// GET ALL response
export const GetPlansResSchema = z.object({
  data: z.object({
    items: z.array(PlanListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET by id body/response
export const GetPlanByIdBodySchema = PlanSchema.pick({ id: true });
export const GetPlanByIdResSchema = z.object({
  data: PlanListItemSchema,
  message: z.string(),
});

/* =========================
   BỔ SUNG: CURRENT & USAGE
========================= */

// Usage item of current subscription
export const SubscriptionFeatureUsageSchema = z.object({
  featureType: z.string(),
  featureName: z.string(),
  usageCount: z.number(),
  limitValue: z.number(),
  limitType: z.string().nullable().optional(),
  isUnlimited: z.boolean(),
  lastUsedAt: z.iso.datetime().optional(), // ISO
  resetAt: z.iso.datetime().optional(), // ISO
  canUse: z.boolean(),
});

// Current subscription payload
export const CurrentSubscriptionSchema = z.object({
  id: z.string(),
  planType: z.string(),
  planName: z.string(),
  startAt: z.iso.datetime(), // ISO
  endAt: z.iso.datetime(), // ISO
  active: z.boolean(),
  autoRenew: z.boolean(),
  daysRemaining: z.number().int(),
  featureUsages: z.array(SubscriptionFeatureUsageSchema).optional(),
});

// GET /subscriptions/current
export const GetCurrentSubscriptionResSchema = z.object({
  data: CurrentSubscriptionSchema,
  message: z.string(),
});

// Query cho /subscriptions/usage (không có lang)
export const GetSubscriptionUsageQuerySchema = z.object({
  pageNumber: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

// GET /subscriptions/usage
export const GetSubscriptionUsageResSchema = z.object({
  data: z.object({
    items: z.array(SubscriptionFeatureUsageSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// Auto-renew
export const UpdateAutoRenewQuerySchema = z.object({
  autoRenew: z.boolean(),
});

export const UpdateAutoRenewResSchema = z.object({
  data: z.object({
    autoRenew: z.boolean(),
  }),
  message: z.string(),
});

// Cancel subscription
export const CancelSubscriptionBodySchema = z.object({
  reason: z.string().min(1),
});

export const CancelSubscriptionResSchema = z.object({
  data: z.any().optional(),
  message: z.string(),
});

// --- Subscribe ---
export const SubscribeBodySchema = z.object({
  subscriptionPlanId: z.string(),
  autoRenew: z.boolean().default(true),
});

export const SubscribeResSchema = z.object({
  message: z.string(),
});

/* =========================
            TYPES
========================= */
export type PlanFeatureType = z.infer<typeof PlanFeatureSchema>;
export type PlanType = z.infer<typeof PlanSchema>;
export type PlanListItemType = z.infer<typeof PlanListItemSchema>;
export type GetPlansQueryType = z.infer<typeof GetPlansQuerySchema>;
export type GetPlanByIdQueryType = z.infer<typeof GetPlanByIdQuerySchema>;
export type GetPlansResType = z.infer<typeof GetPlansResSchema>;
export type GetPlanByIdResType = z.infer<typeof GetPlanByIdResSchema>;

// Current & Usage types
export type SubscriptionFeatureUsageType = z.infer<
  typeof SubscriptionFeatureUsageSchema
>;
export type CurrentSubscriptionType = z.infer<typeof CurrentSubscriptionSchema>;
export type GetCurrentSubscriptionResType = z.infer<
  typeof GetCurrentSubscriptionResSchema
>;
export type GetSubscriptionUsageQueryType = z.infer<
  typeof GetSubscriptionUsageQuerySchema
>;
export type GetSubscriptionUsageResType = z.infer<
  typeof GetSubscriptionUsageResSchema
>;

// Update auto-renew types
export type UpdateAutoRenewQueryType = z.infer<
  typeof UpdateAutoRenewQuerySchema
>;
export type UpdateAutoRenewResType = z.infer<typeof UpdateAutoRenewResSchema>;

// Cancel subscription types
export type CancelSubscriptionBodyType = z.infer<
  typeof CancelSubscriptionBodySchema
>;
export type CancelSubscriptionResType = z.infer<
  typeof CancelSubscriptionResSchema
>;

// Subscribe types
export type SubscribeBodyType = z.infer<typeof SubscribeBodySchema>;
export type SubscribeResType = z.infer<typeof SubscribeResSchema>;
