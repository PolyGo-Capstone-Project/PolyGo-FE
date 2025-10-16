// src/models/subscription.model.ts
import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";
import z from "zod";

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

// GET by id body/response (optional - not used in pricing but included for completeness)
export const GetPlanByIdBodySchema = PlanSchema.pick({ id: true });
export const GetPlanByIdResSchema = z.object({
  data: PlanListItemSchema,
  message: z.string(),
});

// types
export type PlanFeatureType = z.infer<typeof PlanFeatureSchema>;
export type PlanType = z.infer<typeof PlanSchema>;
export type PlanListItemType = z.infer<typeof PlanListItemSchema>;
export type GetPlansQueryType = z.infer<typeof GetPlansQuerySchema>;
export type GetPlanByIdQueryType = z.infer<typeof GetPlanByIdQuerySchema>;
export type GetPlansResType = z.infer<typeof GetPlansResSchema>;
export type GetPlanByIdResType = z.infer<typeof GetPlanByIdResSchema>;
