"use client";

import { LoadingSpinner } from "@/components";
import CreatePostCard from "@/components/modules/social/create-post-card";
import FriendSidebar from "@/components/modules/social/friend-side-bar";
import PostCard from "@/components/modules/social/post-card";
import SuggestedGamesCard from "@/components/modules/social/suggested-games-card";
import { useUserCommunicationHubContext } from "@/components/providers";
import type { ReactionEnumType } from "@/constants";
import { FriendStatus } from "@/constants";
import {
  useCreateComment,
  useCreateReaction,
  useDeleteComment,
  useDeletePost,
  useDeleteReaction,
  useGetFriends,
  useGetUsersMatching,
  usePosts,
  useUpdateComment,
  useWordsetsQuery,
} from "@/hooks";
import { showSuccessToast } from "@/lib";
import authApiRequest from "@/lib/apis/auth";
import type { GetPostItemsType } from "@/models";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

interface ContentProps {
  locale: string;
}

export default function SocialContent({ locale }: ContentProps) {
  const t = useTranslations("social");
  const tSuccess = useTranslations("Success");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<GetPostItemsType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get current user info
  const { data: currentUserData, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApiRequest.me(),
  });

  // Get posts with pagination
  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching,
  } = usePosts({
    params: { pageNumber: page, pageSize: 10 },
  });

  // Update posts when new data arrives
  useEffect(() => {
    if (postsData?.payload?.data?.items) {
      const newPosts = postsData.payload.data.items;

      if (page === 1) {
        setAllPosts(newPosts);
      } else {
        setAllPosts((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      }

      // Check if there are more pages
      const meta = postsData.payload.data;
      setHasMore(meta.currentPage < meta.totalPages);
    }
  }, [postsData, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || postsLoading || isFetching || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isFetching, postsLoading]);

  // Get real friends from API
  const lang = useMemo(() => locale.split("-")[0], [locale]);
  const { data: friendsData } = useGetFriends(
    { lang, pageNumber: 1, pageSize: 100 },
    { enabled: true }
  );

  // Get practice games (12 wordsets)
  const { data: wordsetsData } = useWordsetsQuery({
    params: { lang, pageNumber: 1, pageSize: 10 },
    enabled: true,
  });

  // Get friend suggestions (users with friendStatus=None)
  const { data: suggestedUsersData } = useGetUsersMatching(
    { lang, pageNumber: 1, pageSize: 5 },
    { enabled: true }
  );

  // Get presence context for online status
  const { isUserOnline } = useUserCommunicationHubContext();

  // Mutations
  const createCommentMutation = useCreateComment();
  const createReactionMutation = useCreateReaction();
  const deleteReactionMutation = useDeleteReaction();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const deletePostMutation = useDeletePost();

  // Transform practice games data
  const practiceGames = useMemo(() => {
    if (!wordsetsData?.payload?.data?.items) return [];

    return wordsetsData.payload.data.items.slice(0, 12).map((wordset: any) => ({
      id: wordset.id,
      title: wordset.title || "Untitled Game",
      subtitle: `${wordset.difficulty || "Medium"} • ${wordset.category || "General"}`,
      iconColor: "border-blue-500 text-blue-500",
    }));
  }, [wordsetsData]);

  // Transform friend suggestions (filter friendStatus=None)
  const suggestedFriends = useMemo(() => {
    if (!suggestedUsersData?.payload?.data?.items) return [];

    return suggestedUsersData.payload.data.items
      .filter((user: any) => user.friendStatus === FriendStatus.None)
      .slice(0, 5)
      .map((user: any) => ({
        id: user.id,
        name: user.name || "Unknown",
        avatar: user.avatarUrl || "",
        initials: (user.name || "")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }));
  }, [suggestedUsersData]);

  // Convert friends to Author format and filter online ones
  const allFriends = useMemo(() => {
    if (!friendsData?.payload?.data?.items) return [];

    return friendsData.payload.data.items.map((friend: any) => ({
      name: friend.name,
      avatar: friend.avatarUrl || "",
      initials: friend.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      userId: friend.id,
    }));
  }, [friendsData]);

  const onlineFriends = useMemo(() => {
    return allFriends.filter((friend) =>
      friend.userId ? isUserOnline(friend.userId) : false
    );
  }, [allFriends, isUserOnline]);

  // Current user author
  const currentUserAuthor = useMemo(() => {
    if (!currentUserData?.payload?.data) return null;
    const user = currentUserData.payload.data;
    return {
      id: user.id,
      name: user.name || "",
      avatar: user.avatarUrl || "",
      initials: (user.name || "")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
  }, [currentUserData]);

  // Use allPosts for rendering
  const posts = allPosts;

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
      // Find current user's reaction using myReaction field
      const post = posts.find((p) => p.id === postId);
      const currentReaction = post?.myReaction;

      if (currentReaction === reactionType) {
        // Remove reaction if clicking the same one
        await deleteReactionMutation.mutateAsync(postId);
      } else {
        // Add or change reaction
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

  if (userLoading || postsLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUserAuthor) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <p>Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 3 columns */}
      <div className="flex-1 max-w-8xl mx-auto w-full px-4 py-4 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-6 min-h-0">
          {/* Left */}
          <div className="min-h-0 overflow-y-auto">
            <SuggestedGamesCard t={t} games={practiceGames} />
          </div>

          {/* Middle */}
          <div className="min-h-0 overflow-y-auto">
            <div className="max-w-xl mx-auto w-full lg:max-w-full">
              <CreatePostCard t={t} currentUserAuthor={currentUserAuthor} />
              <div className="space-y-4 md:space-y-6">
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

                {/* Load more trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    {isFetching ? (
                      <LoadingSpinner />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Scroll to load more
                      </p>
                    )}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4">
                    <p className="text-muted-foreground text-sm">
                      No more posts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="min-h-0 overflow-y-auto">
            <FriendSidebar
              t={t}
              suggestedFriends={suggestedFriends}
              onlineFriends={onlineFriends}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
