import {
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";
import { UserMatchingItemSchema } from "@/models/user.model";
import z from "zod";

export const FriendSchema = z.object({
  id: z.string(),
});

const FriendInfoSchema = UserMatchingItemSchema;

// queries:

export const GetFriendsQuerySchema = PaginationLangQuerySchema;

// GET
// Danh sách bạn bè của user
export const GetFriendsResSchema = z.object({
  data: z.object({
    items: z.array(FriendInfoSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// Danh sách lời mời kết bạn đến user - received
export const GetFriendRequestsResSchema = z.object({
  data: z.object({
    items: z.array(FriendInfoSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// Danh sách gửi lời mời kết bạn từ user - sent
export const GetSentFriendRequestsResSchema = z.object({
  data: z.object({
    items: z.array(FriendInfoSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// POST
// Gửi lời mời kết bạn
export const SendFriendRequestBodySchema = z
  .object({
    receiverId: z.string(),
  })
  .strict();

// Chấp nhận/ từ chối lời mời kết bạn
export const FriendRequestBodySchema = z
  .object({
    senderId: z.string(),
  })
  .strict();

// DELETE
// Xóa bạn bè
export const RemoveFriendBodySchema = z
  .object({
    friendId: z.string(),
  })
  .strict();

// Xóa yêu cầu kết bạn đã gửi
export const CancelFriendRequestBodySchema = z
  .object({
    receiverId: z.string(),
  })
  .strict();

//types:
export type FriendType = z.infer<typeof FriendSchema>;
export type GetFriendsQueryType = z.infer<typeof GetFriendsQuerySchema>;
export type GetFriendsResType = z.infer<typeof GetFriendsResSchema>;
export type GetFriendRequestsResType = z.infer<
  typeof GetFriendRequestsResSchema
>;
export type GetSentFriendRequestsResType = z.infer<
  typeof GetSentFriendRequestsResSchema
>;
export type SendFriendRequestBodyType = z.infer<
  typeof SendFriendRequestBodySchema
>;
export type FriendRequestBodyType = z.infer<typeof FriendRequestBodySchema>;
export type RemoveFriendBodyType = z.infer<typeof RemoveFriendBodySchema>;
export type CancelFriendRequestBodyType = z.infer<
  typeof CancelFriendRequestBodySchema
>;
