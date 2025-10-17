// // src/models/subscriptionPlan.model.ts
// import {
//   LangQuerySchema,
//   PaginationLangQuerySchema,
//   PaginationMetaSchema,
// } from "@/models/common.model";
// import z from "zod";

// /* =========================
//    KHU VỰC CŨ (GIỮ NGUYÊN)
// ========================= */

// // Feature of a plan
// export const PlanFeatureSchema = z.object({
//   featureType: z.string(),
//   featureName: z.string(),
//   limitValue: z.number().nullable().optional(),
//   limitType: z.string().nullable().optional(),
//   isEnabled: z.boolean(),
// });

// // Plan item
// export const PlanSchema = z.object({
//   id: z.string(),
//   planType: z.string(),
//   lang: z.string().max(2),
//   name: z.string(),
//   description: z.string().optional(),
//   price: z.number(),
//   durationInDays: z.number().int(),
//   isActive: z.boolean(),
//   createdAt: z.iso.datetime(),
//   lastUpdatedAt: z.iso.datetime(),
//   features: z.array(PlanFeatureSchema),
// });

// // Response list item and pagination
// export const PlanListItemSchema = PlanSchema;

// export const GetPlansQuerySchema = PaginationLangQuerySchema;

// export const GetPlanByIdQuerySchema = LangQuerySchema;

// // GET ALL response
// export const GetPlansResSchema = z.object({
//   data: z.object({
//     items: z.array(PlanListItemSchema),
//     ...PaginationMetaSchema.shape,
//   }),
//   message: z.string(),
// });

// // GET by id body/response (optional - not used in pricing but included for completeness)
// export const GetPlanByIdBodySchema = PlanSchema.pick({ id: true });
// export const GetPlanByIdResSchema = z.object({
//   data: PlanListItemSchema,
//   message: z.string(),
// });

// /* =========================
//    BỔ SUNG: CURRENT & USAGE
// ========================= */

// // Usage item of current subscription
// export const SubscriptionFeatureUsageSchema = z.object({
//   featureType: z.string(),
//   featureName: z.string(),
//   usageCount: z.number(),
//   limitValue: z.number(),
//   limitType: z.string().nullable().optional(),
//   isUnlimited: z.boolean(),
//   lastUsedAt: z.string().nullable().optional(), // ISO
//   resetAt: z.string().nullable().optional(), // ISO
//   canUse: z.boolean(),
// });

// // Current subscription payload
// export const CurrentSubscriptionSchema = z.object({
//   id: z.string(),
//   planType: z.string(),
//   planName: z.string(),
//   startAt: z.string(), // ISO
//   endAt: z.string(), // ISO
//   active: z.boolean(),
//   autoRenew: z.boolean(),
//   daysRemaining: z.number().int(),
//   featureUsages: z.array(SubscriptionFeatureUsageSchema).optional(),
// });

// // GET /subscriptions/current
// export const GetCurrentSubscriptionResSchema = z.object({
//   data: CurrentSubscriptionSchema,
//   message: z.string(),
// });

// // Query cho /subscriptions/usage (không có lang)
// export const GetSubscriptionUsageQuerySchema = z.object({
//   pageNumber: z.number().int().positive().default(1),
//   pageSize: z.number().int().positive().default(10),
// });

// // GET /subscriptions/usage
// export const GetSubscriptionUsageResSchema = z.object({
//   data: z.object({
//     items: z.array(SubscriptionFeatureUsageSchema),
//     ...PaginationMetaSchema.shape,
//   }),
//   message: z.string(),
// });

// //Auto-renew
// export const UpdateAutoRenewQuerySchema = z.object({
//   autoRenew: z.boolean(),
// });

// export const UpdateAutoRenewResSchema = z.object({
//   data: z.object({
//     autoRenew: z.boolean(),
//   }),
//   message: z.string(),
// });

// //Cancel subscription
// export const CancelSubscriptionBodySchema = z.object({
//   reason: z.string().min(1),
// });

// export const CancelSubscriptionResSchema = z.object({
//   data: z.any().optional(),
//   message: z.string(),
// });

// // --- BỔ SUNG: Subscribe ---
// export const SubscribeBodySchema = z.object({
//   subscriptionPlanId: z.string(),
//   autoRenew: z.boolean().default(true),
// });

// export const SubscribeResSchema = z.object({
//   message: z.string(),
// });
// /* =========================
//             TYPES
// ========================= */
// export type PlanFeatureType = z.infer<typeof PlanFeatureSchema>;
// export type PlanType = z.infer<typeof PlanSchema>;
// export type PlanListItemType = z.infer<typeof PlanListItemSchema>;
// export type GetPlansQueryType = z.infer<typeof GetPlansQuerySchema>;
// export type GetPlanByIdQueryType = z.infer<typeof GetPlanByIdQuerySchema>;
// export type GetPlansResType = z.infer<typeof GetPlansResSchema>;
// export type GetPlanByIdResType = z.infer<typeof GetPlanByIdResSchema>;

// // Current & Usage types
// export type SubscriptionFeatureUsageType = z.infer<
//   typeof SubscriptionFeatureUsageSchema
// >;
// export type CurrentSubscriptionType = z.infer<typeof CurrentSubscriptionSchema>;
// export type GetCurrentSubscriptionResType = z.infer<
//   typeof GetCurrentSubscriptionResSchema
// >;
// export type GetSubscriptionUsageQueryType = z.infer<
//   typeof GetSubscriptionUsageQuerySchema
// >;
// export type GetSubscriptionUsageResType = z.infer<
//   typeof GetSubscriptionUsageResSchema
// >;

// // Update auto-renew types
// export type UpdateAutoRenewQueryType = z.infer<
//   typeof UpdateAutoRenewQuerySchema
// >;
// export type UpdateAutoRenewResType = z.infer<typeof UpdateAutoRenewResSchema>;

// // Cancel subscription types
// export type CancelSubscriptionBodyType = z.infer<
//   typeof CancelSubscriptionBodySchema
// >;
// export type CancelSubscriptionResType = z.infer<
//   typeof CancelSubscriptionResSchema
// >;

// // Subscribe types

// export type SubscribeBodyType = z.infer<typeof SubscribeBodySchema>;
// export type SubscribeResType = z.infer<typeof SubscribeResSchema>;
