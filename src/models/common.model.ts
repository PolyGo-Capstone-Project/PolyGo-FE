import { z } from "zod";

export const MessageResSchema = z.object({
  data: null,
  message: z.string(),
});

export const PaginationMetaSchema = z.object({
  totalItems: z.number().nonnegative(),
  currentPage: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  pageSize: z.number().int().min(0),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const LangQuerySchema = z.object({
  lang: z.string().optional(),
});

export const PaginationQuerySchema = z.object({
  pageNumber: z.number().int().optional(),
  pageSize: z.number().int().optional(),
});

export const PaginationLangQuerySchema =
  PaginationQuerySchema.merge(LangQuerySchema);

export type MessageResType = z.infer<typeof MessageResSchema>;
export type PaginationMetaType = z.infer<typeof PaginationMetaSchema>;
export type LangQueryType = z.infer<typeof LangQuerySchema>;
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
export type PaginationLangQueryType = z.infer<typeof PaginationLangQuerySchema>;
