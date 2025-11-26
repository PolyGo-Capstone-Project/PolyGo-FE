import z from "zod";

import {
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";

/** ====== Notification ====== */

export const NotificationSchema = z.object({
  id: z.string(),
  lang: z.string().max(2),
  content: z.string(),
  isRead: z.boolean(),
  createdAt: z.iso.datetime(),
  type: z.string(), // ví dụ: "Friend", "Post", ... (backend kiểm soát)
  objectId: z.string(),
  imageUrl: z.string().optional().nullable(),
});

/** ====== Query Schemas ====== */

export const GetNotificationsQuerySchema = PaginationLangQuerySchema;

// GET ALL
export const GetNotificationsResSchema = z.object({
  data: z.object({
    items: z.array(NotificationSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// types
export type NotificationType = z.infer<typeof NotificationSchema>;
export type GetNotificationsQueryType = z.infer<
  typeof GetNotificationsQuerySchema
>;
export type GetNotificationsResType = z.infer<typeof GetNotificationsResSchema>;
