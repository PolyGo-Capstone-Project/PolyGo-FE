"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  LoadingSpinner,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import type { ReactionEnumType } from "@/constants";
import { ReactionEnum } from "@/constants";
import {
  useCreateComment,
  useCreateReaction,
  useDeleteComment,
  useDeleteReaction,
  usePostById,
  useUpdateComment,
} from "@/hooks";
import authApiRequest from "@/lib/apis/auth";
import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconHeart,
  IconMoodAngry,
  IconMoodHappy,
  IconMoodSad,
  IconMoodSmile,
  IconSend2,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

interface PostDetailContentProps {
  postId: string;
}

// Helper to get reaction icon
const getReactionIcon = (type: ReactionEnumType, size = 18) => {
  switch (type) {
    case ReactionEnum.Like:
      return <IconMoodSmile size={size} className="text-blue-500" />;
    case ReactionEnum.Love:
      return <IconHeart size={size} className="text-red-500" />;
    case ReactionEnum.Haha:
      return <IconMoodHappy size={size} className="text-yellow-500" />;
    case ReactionEnum.Wow:
      return <IconSparkles size={size} className="text-purple-500" />;
    case ReactionEnum.Sad:
      return <IconMoodSad size={size} className="text-gray-500" />;
    case ReactionEnum.Angry:
      return <IconMoodAngry size={size} className="text-orange-500" />;
    default:
      return null;
  }
};

export default function PostDetailContent({ postId }: PostDetailContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const imageIndex = parseInt(searchParams.get("imageIndex") || "0");

  const [selectedImageIndex, setSelectedImageIndex] = useState(imageIndex);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showReactionsDialog, setShowReactionsDialog] = useState(false);
  const [selectedReactionTab, setSelectedReactionTab] = useState("all");

  // Get current user info
  const { data: currentUserData, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApiRequest.me(),
  });

  // Get post data
  const { data: postData, isLoading: postLoading } = usePostById({
    id: postId,
  });

  // Mutations
  const createCommentMutation = useCreateComment();
  const createReactionMutation = useCreateReaction();
  const deleteReactionMutation = useDeleteReaction();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const post = useMemo(() => {
    const data = postData?.payload?.data;
    // GetPostByIdResType returns data directly (not paginated)
    return data;
  }, [postData]);
  const currentUser = useMemo(
    () => currentUserData?.payload?.data,
    [currentUserData]
  );

  // Current user author
  const currentUserAuthor = useMemo(() => {
    if (!currentUser) return null;
    return {
      id: currentUser.id,
      name: currentUser.name || "",
      avatar: currentUser.avatarUrl || "",
      initials: (currentUser.name || "")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
  }, [currentUser]);

  // Calculate time ago
  const timeAgo = useMemo(() => {
    if (!post) return "";
    try {
      return formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  }, [post]);

  // Get user's current reaction
  const userReaction = useMemo(() => {
    return post?.myReaction;
  }, [post?.myReaction]);

  // Calculate total reactions
  const totalReactions = useMemo(() => {
    return (
      post?.reactions?.reduce(
        (sum: number, r: any) => sum + (r.count || 0),
        0
      ) || 0
    );
  }, [post?.reactions]);

  // Group reactions by type for dialog
  const reactionsByType = useMemo(() => {
    if (!post?.reactions) return {};

    const grouped: Record<string, any[]> = {};
    post.reactions.forEach((reaction: any) => {
      if (!grouped[reaction.reactionType]) {
        grouped[reaction.reactionType] = [];
      }
      grouped[reaction.reactionType].push(reaction);
    });
    return grouped;
  }, [post?.reactions]);

  // Get all unique users who reacted
  const allReactedUsers = useMemo(() => {
    if (!post?.reactions) return [];
    return post.reactions
      .filter((r: any) => r.user) // Filter out reactions without user
      .flatMap((r: any) =>
        Array(r.count || 0).fill({ ...r.user, reactionType: r.reactionType })
      );
  }, [post?.reactions]);

  // Handle reaction
  const handleReaction = async (reactionType: ReactionEnumType) => {
    try {
      if (userReaction === reactionType) {
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

  // Handle comment submit
  const handleCommentSubmit = async () => {
    const text = commentInput.trim();
    if (!text) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        body: { content: text },
      });
      setCommentInput("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  // Handle comment update
  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        body: { content },
      });
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Handle comment delete
  const handleCommentDelete = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (userLoading || postLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!post || !currentUserAuthor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  const images = post.imageUrls || [];
  const hasImages = images.length > 0;

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <IconArrowLeft size={20} />
        </Button>
        <h1 className="font-semibold">Post</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <IconX size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
        {/* Left Side - Image (only if has images) */}
        {hasImages && (
          <div className="lg:flex-1 bg-black flex items-center justify-center relative">
            <Image
              src={images[selectedImageIndex]}
              alt="Post image"
              width={1200}
              height={800}
              style={{ objectFit: "contain" }}
              className="max-h-full"
            />

            {/* Image navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Prev/Next buttons */}
            {images.length > 1 && selectedImageIndex > 0 && (
              <button
                onClick={() => setSelectedImageIndex((prev) => prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <IconArrowLeft size={24} />
              </button>
            )}
            {images.length > 1 && selectedImageIndex < images.length - 1 && (
              <button
                onClick={() => setSelectedImageIndex((prev) => prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <IconArrowLeft size={24} className="rotate-180" />
              </button>
            )}
          </div>
        )}

        {/* Right Side - Post Info & Comments */}
        <div
          className={`flex flex-col bg-background ${hasImages ? "lg:w-[400px] xl:w-[500px]" : "flex-1 max-w-2xl mx-auto w-full"}`}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Post Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                  <Avatar
                    className="h-10 w-10 cursor-pointer"
                    onClick={() =>
                      router.push(`/${locale}/matching/${post.creator.id}`)
                    }
                  >
                    <AvatarImage src={post.creator.avatarUrl} />
                    <AvatarFallback>
                      {(post.creator.name || "")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      className="font-semibold hover:underline text-left"
                      onClick={() =>
                        router.push(`/${locale}/matching/${post.creator.id}`)
                      }
                    >
                      {post.creator.name || "Unknown"}
                    </button>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:underline"
                  onClick={() =>
                    totalReactions > 0 && setShowReactionsDialog(true)
                  }
                >
                  {post.reactions && post.reactions.length > 0 && (
                    <>
                      <div className="flex -space-x-1">
                        {post.reactions
                          .slice(0, 3)
                          .map((reaction: any, idx: number) => (
                            <div key={idx} className="inline-block">
                              {getReactionIcon(reaction.reactionType, 14)}
                            </div>
                          ))}
                      </div>
                      <span>{totalReactions}</span>
                    </>
                  )}
                </div>
                <span>
                  {post.commentsCount}{" "}
                  {post.commentsCount === 1 ? "comment" : "comments"}
                </span>
              </div>

              <Separator className="mb-3" />

              {/* Reaction Buttons */}
              <div className="flex gap-1 mb-2">
                {Object.values(ReactionEnum).map((reaction) => (
                  <Button
                    key={reaction}
                    variant={userReaction === reaction ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleReaction(reaction)}
                    className="px-2"
                  >
                    {getReactionIcon(reaction, 18)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-4 space-y-4">
              <h3 className="font-semibold">Comments</h3>
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((c: any) => {
                    const isOwnComment = c.user.id === currentUserAuthor.id;
                    const isEditing = editingCommentId === c.id;

                    return (
                      <div key={c.id} className="flex gap-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={c.user.avatarUrl} />
                          <AvatarFallback>
                            {(c.user.name || "")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Input
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="text-sm"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9"
                                onClick={() => {
                                  if (editingContent.trim()) {
                                    handleCommentUpdate(c.id, editingContent);
                                  }
                                }}
                              >
                                <IconCheck size={18} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent("");
                                }}
                              >
                                <IconX size={18} />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="bg-muted rounded-lg p-3 group relative">
                                <p className="text-sm font-semibold">
                                  {c.user.name || "Unknown"}
                                </p>
                                <p className="text-sm break-words">
                                  {c.content}
                                </p>
                                {isOwnComment && (
                                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setEditingCommentId(c.id);
                                        setEditingContent(c.content);
                                      }}
                                    >
                                      <IconEdit size={16} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        handleCommentDelete(c.id);
                                      }}
                                    >
                                      <IconTrash size={16} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(c.createdAt), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Comment Input - Sticky at bottom */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={currentUserAuthor.avatar} />
                <AvatarFallback>{currentUserAuthor.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleCommentSubmit}
                  disabled={!commentInput.trim()}
                >
                  <IconSend2 size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reactions Dialog */}
      <Dialog open={showReactionsDialog} onOpenChange={setShowReactionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reactions</DialogTitle>
          </DialogHeader>
          <Tabs
            value={selectedReactionTab}
            onValueChange={setSelectedReactionTab}
          >
            <TabsList className="w-full grid grid-cols-7">
              <TabsTrigger value="all" className="text-xs">
                All {totalReactions > 0 && `(${totalReactions})`}
              </TabsTrigger>
              {Object.entries(reactionsByType).map(([type, reactions]) => (
                <TabsTrigger key={type} value={type} className="text-xs p-1">
                  <div className="flex items-center gap-1">
                    {getReactionIcon(type as ReactionEnumType, 16)}
                    <span>
                      {reactions.reduce((sum, r) => sum + (r.count || 0), 0)}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {allReactedUsers.length > 0 ? (
                  allReactedUsers.map((user: any, idx: number) => (
                    <div
                      key={`${user.id}-${idx}`}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                      onClick={() => {
                        router.push(`/${locale}/matching/${user.id}`);
                        setShowReactionsDialog(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>
                            {(user.name || "")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                      {getReactionIcon(user.reactionType, 20)}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No reactions yet
                  </p>
                )}
              </div>
            </TabsContent>

            {Object.entries(reactionsByType).map(([type, reactions]) => (
              <TabsContent
                key={type}
                value={type}
                className="max-h-[400px] overflow-y-auto"
              >
                <div className="space-y-2">
                  {reactions
                    .filter((r: any) => r.user) // Filter out reactions without user
                    .flatMap((r: any) =>
                      Array(r.count || 0)
                        .fill(null)
                        .map((_, idx) => (
                          <div
                            key={`${r.user.id}-${idx}`}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                            onClick={() => {
                              router.push(`/${locale}/matching/${r.user.id}`);
                              setShowReactionsDialog(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={r.user.avatarUrl} />
                                <AvatarFallback>
                                  {(r.user.name || "")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "??"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {r.user.name || "Unknown"}
                              </span>
                            </div>
                            {getReactionIcon(type as ReactionEnumType, 20)}
                          </div>
                        ))
                    )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
