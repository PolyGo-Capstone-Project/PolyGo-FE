import { ReportEnum, ReportStatusEnum } from "@/constants";
import {
  PaginationMetaSchema,
  PaginationQuerySchema,
} from "@/models/common.model";
import z from "zod";

export const ReportSchema = z.object({
  id: z.string(),
  reportType: z.enum(ReportEnum),
  targetId: z.string(),
  reporterId: z.string(),
  reason: z.string().min(10).max(1000),
  description: z.string().max(2000).optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  status: z.enum(ReportStatusEnum).default(ReportStatusEnum.Pending),
  adminResponse: z.string().max(1000).optional(),
  adminResponseToTarget: z.string().max(1000).optional(),
  processedById: z.string(),
  createdAt: z.iso.datetime(),
  processedAt: z.iso.datetime().nullable().optional(),
});

const UserInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  mail: z.string(),
  avatarUrl: z.string().optional(),
});

const ReportTargetEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
});

const ReportTargetPostSchema = z.object({
  id: z.string(),
  content: z.string(),
  creator: UserInfoSchema.optional(),
});

export const ReportTargetInfoSchema = z.union([
  UserInfoSchema,
  ReportTargetEventSchema,
  ReportTargetPostSchema,
]);

// Query:
export const ReportQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(ReportStatusEnum).optional(),
  reportType: z.enum(ReportEnum).optional(),
});

// GET - for admin
// items
export const GetReportItemSchema = ReportSchema.extend({
  reporter: UserInfoSchema,
  processedBy: UserInfoSchema.optional(),
  targetInfo: ReportTargetInfoSchema.optional(),
});

export const GetReportListSchema = z.object({
  data: z.object({
    items: z.array(GetReportItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET - for user reports
export const GetUserReportItemSchema = ReportSchema.omit({
  reporterId: true,
}).extend({
  processedBy: UserInfoSchema.optional(),
});

export const GetUserReportListSchema = z.object({
  data: z.object({
    items: z.array(GetUserReportItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET ONE
export const GetReportByIdSchema = z.object({
  data: GetReportItemSchema,
  message: z.string(),
});

// POST - create report
export const CreateReportBodySchema = ReportSchema.pick({
  reportType: true,
  targetId: true,
  reason: true,
  description: true,
  imageUrls: true,
}).strict();

// PUT - admin process report
export const ProcessReportBodySchema = ReportSchema.pick({
  status: true,
  adminResponse: true,
  adminResponseToTarget: true,
}).strict();

//types
export type ReportModel = z.infer<typeof ReportSchema>;
export type ReportTargetInfoType = z.infer<typeof ReportTargetInfoSchema>;
export type ReportQueryType = z.infer<typeof ReportQuerySchema>;

export type GetReportItemType = z.infer<typeof GetReportItemSchema>;
export type GetReportListType = z.infer<typeof GetReportListSchema>;
export type GetReportByIdType = z.infer<typeof GetReportByIdSchema>;
export type GetUserReportListType = z.infer<typeof GetUserReportListSchema>;
export type CreateReportBodyType = z.infer<typeof CreateReportBodySchema>;
export type ProcessReportBodyType = z.infer<typeof ProcessReportBodySchema>;
