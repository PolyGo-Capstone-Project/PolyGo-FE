import { z } from "zod";

import { MessageEnum } from "@/constants";
import { PaginationMetaSchema, PaginationQuerySchema } from "./common.model";

export const GetMessagesQuerySchema = PaginationQuerySchema;
export const GetConversationsQuerySchema = PaginationQuerySchema.extend({
  name: z.string().min(1).max(100).optional(),
});

export const UserInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const LastMessageSchema = z.object({
  type: z.enum(MessageEnum),
  content: z.string(),
  sentAt: z.string(),
  isSentByYou: z.boolean(),
});

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.enum(MessageEnum),
  conversationId: z.string(),
  sentAt: z.string(),
  sender: UserInfoSchema,
});

export const MessageListResSchema = z.object({
  data: z.object({
    items: z.array(MessageSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  lastMessage: LastMessageSchema.nullable(),
  user: UserInfoSchema,
});

export const ConversationListResSchema = z.object({
  data: z.object({
    items: z.array(ConversationSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const RealtimeMessageSchema = z.object({
  senderId: z.string(),
  type: z.enum(MessageEnum),
  content: z.string(),
  conversationId: z.string(),
  sentAt: z.string(), // Changed from createdTime to sentAt to match BE
});

export const ConversationReadUpdatedSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  hasSeen: z.boolean(),
});

// ============= TYPES =============
export type UserInfoType = z.infer<typeof UserInfoSchema>;
export type LastMessageType = z.infer<typeof LastMessageSchema>;
export type MessageType = z.infer<typeof MessageSchema>;
export type MessageListResType = z.infer<typeof MessageListResSchema>;
export type ConversationType = z.infer<typeof ConversationSchema>;
export type ConversationListResType = z.infer<typeof ConversationListResSchema>;
export type GetMessagesQueryType = z.infer<typeof GetMessagesQuerySchema>;
export type GetConversationsQueryType = z.infer<
  typeof GetConversationsQuerySchema
>;
export type RealtimeMessageType = z.infer<typeof RealtimeMessageSchema>;
export type ConversationReadUpdatedType = z.infer<
  typeof ConversationReadUpdatedSchema
>;
