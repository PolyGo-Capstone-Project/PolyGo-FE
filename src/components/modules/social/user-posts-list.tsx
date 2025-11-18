"use client";

import { Card, CardContent, LoadingSpinner } from "@/components";
import PostCard from "@/components/modules/social/post-card";
import type { ReactionEnumType } from "@/constants";
import {
  useCreateComment,
  useCreateReaction,
  useDeleteComment,
  useDeletePost,
  useDeleteReaction,
  useMyPosts,
  useUpdateComment,
  useUserPosts,
} from "@/hooks";
import { showSuccessToast } from "@/lib";
import type { GetPostItemsType } from "@/models";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type Author = { id: string; name: string; avatar: string; initials: string };

type UserPostsListProps = {
  userId?: string; // If undefined, use useMyPosts, otherwise use useUserPosts
  currentUserAuthor: Author;
  locale: string;
};

export function UserPostsList({
  userId,
  currentUserAuthor,
  locale,
}: UserPostsListProps) {
  const t = useTranslations("social");
  const tSuccess = useTranslations("Success");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  // Use the appropriate hook based on whether userId is provided
  const {
    data: myPostsData,
    isLoading: isLoadingMyPosts,
    error: myPostsError,
  } = useMyPosts({
    params: { pageNumber: 1, pageSize: 20 },
    enabled: !userId,
  });

  const {
    data: userPostsData,
    isLoading: isLoadingUserPosts,
    error: userPostsError,
  } = useUserPosts({
    userId: userId || "",
    params: { pageNumber: 1, pageSize: 20 },
    enabled: !!userId,
  });

  // Mutations
  const createCommentMutation = useCreateComment();
  const createReactionMutation = useCreateReaction();
  const deleteReactionMutation = useDeleteReaction();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const deletePostMutation = useDeletePost();

  // Determine which data to use
  const postsData = userId ? userPostsData : myPostsData;
  const isLoading = userId ? isLoadingUserPosts : isLoadingMyPosts;
  const error = userId ? userPostsError : myPostsError;

  const posts: GetPostItemsType[] = useMemo(() => {
    return postsData?.payload?.data?.items || [];
  }, [postsData]);

  // Handlers
  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        body: { content: text },
      });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleReaction = async (
    postId: string,
    reactionType: ReactionEnumType
  ) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const currentReaction = post?.myReaction;

      if (currentReaction === reactionType) {
        await deleteReactionMutation.mutateAsync(postId);
      } else {
        await createReactionMutation.mutateAsync({
          postId,
          body: { reactionType },
        });
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        body: { content },
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      showSuccessToast("Delete", tSuccess);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Failed to load posts</p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">
            {t("post.noPosts") || "No posts yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          t={t}
          currentUserAuthor={currentUserAuthor}
          onReact={handleReaction}
          commentValue={commentInputs[post.id] || ""}
          onCommentChange={handleCommentChange}
          onCommentSubmit={handleCommentSubmit}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
          onPostDelete={handlePostDelete}
        />
      ))}
    </div>
  );
}
