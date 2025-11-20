import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import postApiRequest from "@/lib/apis/post";
import {
  CreateCommentBodyType,
  CreatePostBodyType,
  CreateReactionBodyType,
  GetPostQueryType,
  SharePostBodyType,
  UpdateCommentBodyType,
  UpdatePostBodyType,
} from "@/models";

// ===== GET POSTS =====
type PostsQueryResponse = Awaited<ReturnType<typeof postApiRequest.getPosts>>;

type UsePostsQueryOptions = {
  enabled?: boolean;
  params?: GetPostQueryType;
};

export const usePosts = ({
  enabled = true,
  params,
}: UsePostsQueryOptions = {}) => {
  return useQuery<PostsQueryResponse>({
    queryKey: ["posts", params ?? null],
    queryFn: () => postApiRequest.getPosts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// ===== GET POST BY ID =====
type PostByIdQueryResponse = Awaited<
  ReturnType<typeof postApiRequest.getPostById>
>;

type UsePostByIdQueryOptions = {
  enabled?: boolean;
  id: string;
};

export const usePostById = ({
  enabled = true,
  id,
}: UsePostByIdQueryOptions) => {
  return useQuery<PostByIdQueryResponse>({
    queryKey: ["posts", id],
    queryFn: () => postApiRequest.getPostById(id),
    enabled: enabled && !!id,
    placeholderData: keepPreviousData,
  });
};

// ===== GET MY POSTS =====
type MyPostsQueryResponse = Awaited<
  ReturnType<typeof postApiRequest.getMyPosts>
>;

type UseMyPostsQueryOptions = {
  enabled?: boolean;
  params?: GetPostQueryType;
};

export const useMyPosts = ({
  enabled = true,
  params,
}: UseMyPostsQueryOptions = {}) => {
  return useQuery<MyPostsQueryResponse>({
    queryKey: ["my-posts", params ?? null],
    queryFn: () => postApiRequest.getMyPosts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// ===== GET USER POSTS =====
type UserPostsQueryResponse = Awaited<
  ReturnType<typeof postApiRequest.getUserPosts>
>;

type UseUserPostsQueryOptions = {
  enabled?: boolean;
  userId: string;
  params?: GetPostQueryType;
};

export const useUserPosts = ({
  enabled = true,
  userId,
  params,
}: UseUserPostsQueryOptions) => {
  return useQuery<UserPostsQueryResponse>({
    queryKey: ["user-posts", userId, params ?? null],
    queryFn: () => postApiRequest.getUserPosts(userId, params),
    enabled: enabled && !!userId,
    placeholderData: keepPreviousData,
  });
};

// ===== CREATE POST =====
type CreatePostMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.createPost>
>;

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePostMutationResponse, Error, CreatePostBodyType>({
    mutationFn: (body) => postApiRequest.createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};

// ===== UPDATE POST =====
type UpdatePostMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.updatePost>
>;

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePostMutationResponse,
    Error,
    { id: string; body: UpdatePostBodyType }
  >({
    mutationFn: ({ id, body }) => postApiRequest.updatePost(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};

// ===== DELETE POST =====
type DeletePostMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.deletePost>
>;

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePostMutationResponse, Error, string>({
    mutationFn: (id) => postApiRequest.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};

// ===== CREATE COMMENT =====
type CreateCommentMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.createComment>
>;

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateCommentMutationResponse,
    Error,
    { postId: string; body: CreateCommentBodyType }
  >({
    mutationFn: ({ postId, body }) =>
      postApiRequest.createComment(postId, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
    },
  });
};

// ===== UPDATE COMMENT =====
type UpdateCommentMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.updateComment>
>;

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCommentMutationResponse,
    Error,
    { commentId: string; body: UpdateCommentBodyType }
  >({
    mutationFn: ({ commentId, body }) =>
      postApiRequest.updateComment(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// ===== DELETE COMMENT =====
type DeleteCommentMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.deleteComment>
>;

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCommentMutationResponse, Error, string>({
    mutationFn: (commentId) => postApiRequest.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// ===== CREATE REACTION =====
type CreateReactionMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.createReaction>
>;

export const useCreateReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateReactionMutationResponse,
    Error,
    { postId: string; body: CreateReactionBodyType }
  >({
    mutationFn: ({ postId, body }) =>
      postApiRequest.createReaction(postId, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
    },
  });
};

// ===== DELETE REACTION =====
type DeleteReactionMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.deleteReaction>
>;

export const useDeleteReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteReactionMutationResponse, Error, string>({
    mutationFn: (postId) => postApiRequest.deleteReaction(postId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables] });
    },
  });
};

// ===== SHARE POST =====
type SharePostMutationResponse = Awaited<
  ReturnType<typeof postApiRequest.share>
>;

export const useSharePost = () => {
  const queryClient = useQueryClient();

  return useMutation<SharePostMutationResponse, Error, SharePostBodyType>({
    mutationFn: (body) => postApiRequest.share(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};
