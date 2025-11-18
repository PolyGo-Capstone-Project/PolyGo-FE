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
  IconSend2,
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

// Helper to get reaction emoji image
const getReactionEmoji = (type: ReactionEnumType, size = 24) => {
  const emojiMap: Record<ReactionEnumType, string> = {
    Like: "/assets/social_emoji/like.png",
    Love: "/assets/social_emoji/heart.png",
    Haha: "/assets/social_emoji/haha.png",
    Wow: "/assets/social_emoji/surprised.png",
    Sad: "/assets/social_emoji/sad.png",
    Angry: "/assets/social_emoji/angry.png",
  };

  return (
    <Image
      src={emojiMap[type]}
      alt={type}
      width={size}
      height={size}
      className="inline-block"
    />
  );
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

  // Play pop sound
  const playPopSound = () => {
    const audio = new Audio("/sounds/pop.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Sound play failed:", err));
  };

  // Handle reaction with sound
  const handleReaction = async (reactionType: ReactionEnumType) => {
    playPopSound();
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
          <div className="lg:flex-1 bg-white flex items-center justify-center relative dark:bg-black">
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <Avatar
                    className="h-11 w-11 cursor-pointer ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
                    onClick={() =>
                      router.push(`/${locale}/matching/${post.creator.id}`)
                    }
                  >
                    <AvatarImage src={post.creator.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
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
                      className="font-semibold hover:underline text-left hover:text-primary transition-colors"
                      onClick={() =>
                        router.push(`/${locale}/matching/${post.creator.id}`)
                      }
                    >
                      {post.creator.name || "Unknown"}
                    </button>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm whitespace-pre-wrap mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:underline"
                  onClick={() =>
                    totalReactions > 0 && setShowReactionsDialog(true)
                  }
                >
                  {post.reactions && post.reactions.length > 0 && (
                    <>
                      <div className="flex -space-x-2 items-center">
                        {post.reactions
                          .slice(0, 3)
                          .map((reaction: any, idx: number) => (
                            <div
                              key={idx}
                              className="inline-block ring-2 ring-background rounded-full"
                            >
                              {getReactionEmoji(reaction.reactionType, 20)}
                            </div>
                          ))}
                      </div>
                      <span className="font-medium">{totalReactions}</span>
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
              <div className="flex gap-1 flex-wrap mb-3">
                {Object.values(ReactionEnum).map((reaction) => (
                  <Button
                    key={reaction}
                    variant={userReaction === reaction ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleReaction(reaction)}
                    className="px-2 h-9 hover:scale-110 active:scale-95 transition-all"
                  >
                    {getReactionEmoji(reaction, 20)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Comments</h3>
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-3">
                  {post.comments.map((c: any) => {
                    const isOwnComment = c.user.id === currentUserAuthor.id;
                    const isEditing = editingCommentId === c.id;

                    return (
                      <div
                        key={c.id}
                        className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-border">
                          <AvatarImage src={c.user.avatarUrl} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-accent">
                            {(c.user.name || "")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Input
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="text-sm h-9"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20"
                                onClick={() => {
                                  if (editingContent.trim()) {
                                    handleCommentUpdate(c.id, editingContent);
                                  }
                                }}
                              >
                                <IconCheck size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent("");
                                }}
                              >
                                <IconX size={16} />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="bg-accent/50 rounded-2xl px-3 py-2 group relative hover:bg-accent/70 transition-colors">
                                <p className="text-sm font-semibold mb-0.5">
                                  {c.user.name || "Unknown"}
                                </p>
                                <p className="text-sm break-words leading-relaxed">
                                  {c.content}
                                </p>
                                {isOwnComment && (
                                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-0.5 shadow-sm">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setEditingCommentId(c.id);
                                        setEditingContent(c.content);
                                      }}
                                    >
                                      <IconEdit size={14} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                      onClick={() => {
                                        handleCommentDelete(c.id);
                                      }}
                                    >
                                      <IconTrash size={14} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1.5 px-3">
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
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Comment Input - Sticky at bottom */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2 items-start">
              <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border">
                <AvatarImage src={currentUserAuthor.avatar} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                  {currentUserAuthor.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2 items-center bg-accent/30 rounded-full px-4 py-2 focus-within:bg-accent/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Input
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                  className="border-none bg-transparent focus-visible:ring-0 text-sm h-auto py-0"
                />
                <Button
                  size="icon"
                  onClick={handleCommentSubmit}
                  disabled={!commentInput.trim()}
                  className="h-8 w-8 rounded-full disabled:opacity-50 hover:scale-110 active:scale-95 transition-all"
                >
                  <IconSend2 size={16} />
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
                    {getReactionEmoji(type as ReactionEnumType, 18)}
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
                        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
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
                      {getReactionEmoji(user.reactionType, 24)}
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
                              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                <AvatarImage src={r.user.avatarUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
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
                            {getReactionEmoji(type as ReactionEnumType, 24)}
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
