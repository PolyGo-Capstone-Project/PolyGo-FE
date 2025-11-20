import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateCommentBodyType,
  CreateCommentResType,
  CreatePostBodyType,
  CreatePostResType,
  CreateReactionBodyType,
  GetPostByIdResType,
  GetPostQueryType,
  GetPostResType,
  GetUserPostResType,
  MessageResType,
  SearchPostQueryType,
  SharePostBodyType,
  UpdateCommentBodyType,
  UpdatePostBodyType,
} from "@/models";

const prefix = "/posts";

const postApiRequest = {
  // GET posts
  getPosts: createGetAll<GetPostResType, SearchPostQueryType>(prefix),
  // POST post
  createPost: (body: CreatePostBodyType) =>
    http.post<CreatePostResType>(`${prefix}`, body),
  // GET my posts
  getMyPosts: createGetAll<GetUserPostResType, GetPostQueryType>(
    `${prefix}/me`
  ),
  // GET user posts
  getUserPosts: createGetOne<GetUserPostResType, GetPostQueryType>(
    `${prefix}/user`
  ),
  // GET post by ID
  getPostById: createGetOne<GetPostByIdResType>(prefix),
  // PUT post by ID
  updatePost: (id: string, body: UpdatePostBodyType) =>
    http.put<CreatePostResType>(`${prefix}/${id}`, body),
  // DELETE post by ID
  deletePost: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
  // POST share post/event
  share: (body: SharePostBodyType) =>
    http.post<MessageResType>(`${prefix}/share`, body),
  // POST commnet
  createComment: (postId: string, body: CreateCommentBodyType) =>
    http.post<CreateCommentResType>(`${prefix}/${postId}/comments`, body),
  // Update comment
  updateComment: (commentId: string, body: UpdateCommentBodyType) =>
    http.put<CreateCommentResType>(`${prefix}/comments/${commentId}`, body),
  // Delete comment
  deleteComment: (commentId: string) =>
    http.delete<MessageResType>(`${prefix}/comments/${commentId}`),
  // Post reaction
  createReaction: (postId: string, body: CreateReactionBodyType) =>
    http.post<MessageResType>(`${prefix}/${postId}/reactions`, body),
  // Delete reaction
  deleteReaction: (postId: string) =>
    http.delete<MessageResType>(`${prefix}/${postId}/reactions`),
};

export default postApiRequest;
