import { ReactionEnum } from "@/constants";
import {
  PaginationMetaSchema,
  PaginationQuerySchema,
} from "@/models/common.model";
import z from "zod";

export const PostSchema = z.object({
  id: z.string(),
  content: z.string().max(5000),
  imageUrls: z.array(z.string()).optional().default([]),
  createdAt: z.iso.datetime(),
  creatorId: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string().max(1000),
  postId: z.string(),
  userId: z.string(),
  createdAt: z.iso.datetime(),
});

export const ReactionSchema = z.object({
  postId: z.string(),
  userId: z.string(),
  reactionType: z.enum(ReactionEnum),
});

export const creatorInfor = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional(),
});

const PostResSchema = PostSchema.extend({
  creator: creatorInfor,
});

const CommentResSchema = CommentSchema.extend({
  user: creatorInfor,
});

// query:
export const GetPostQuerySchema = PaginationQuerySchema;

// GET POSTS
export const GetPostItemsSchema = PostSchema.extend({
  creator: creatorInfor,
  commentsCount: z.number().nonnegative().default(0),
  reactionsCount: z.number().nonnegative().default(0),
  comments: z
    .array(
      CommentSchema.extend({
        user: creatorInfor,
      })
    )
    .default([]),
  reactions: z.array(ReactionSchema.extend({ user: creatorInfor })).default([]),
});

export const GetPostResSchema = z.object({
  data: z.object({
    items: z.array(GetPostItemsSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET POST BY ID
export const GetPostByIdResSchema = z.object({
  data: GetPostItemsSchema.extend({
    myReaction: z.enum(ReactionEnum).optional(),
  }),
  message: z.string(),
});

// GET MY//USER POSTs
export const GetUserPostResSchema = z.object({
  data: z.object({
    items: z.array(GetPostItemsSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// POST
export const CreatePostBodySchema = PostSchema.pick({
  content: true,
  imageUrls: true,
}).strict();

export const CreatePostResSchema = z.object({
  data: PostResSchema,
  message: z.string(),
});

// comment:
export const CreateCommentBodySchema = CommentSchema.pick({
  content: true,
}).strict();

export const CreateCommentResSchema = z.object({
  data: CommentResSchema,
  message: z.string(),
});

// reaction:
export const CreateReactionBodySchema = z.object({
  reactionType: z.enum(ReactionEnum),
});

// PUT
export const UpdatePostBodySchema = CreatePostBodySchema.partial();
export const UpdateCommentBodySchema = CreateCommentBodySchema.partial();

//types:
export type PostType = z.infer<typeof PostSchema>;
export type CommentType = z.infer<typeof CommentSchema>;
export type ReactionType = z.infer<typeof ReactionSchema>;
export type GetPostQueryType = z.infer<typeof GetPostQuerySchema>;

export type GetPostItemsType = z.infer<typeof GetPostItemsSchema>;
export type GetPostResType = z.infer<typeof GetPostResSchema>;
export type GetPostByIdResType = z.infer<typeof GetPostByIdResSchema>;
export type GetUserPostResType = z.infer<typeof GetUserPostResSchema>;
export type CreatePostBodyType = z.infer<typeof CreatePostBodySchema>;
export type CreatePostResType = z.infer<typeof CreatePostResSchema>;
export type CreateCommentBodyType = z.infer<typeof CreateCommentBodySchema>;
export type CreateCommentResType = z.infer<typeof CreateCommentResSchema>;
export type CreateReactionBodyType = z.infer<typeof CreateReactionBodySchema>;
export type UpdatePostBodyType = z.infer<typeof UpdatePostBodySchema>;
export type UpdateCommentBodyType = z.infer<typeof UpdateCommentBodySchema>;
