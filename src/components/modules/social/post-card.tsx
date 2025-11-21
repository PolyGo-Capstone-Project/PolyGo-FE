"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  MarkdownRenderer,
  MDXEditorWrapper,
  Separator,
} from "@/components";
import { SharePostDialog } from "@/components/modules/social";
import type { ReactionEnumType } from "@/constants";
import { ReactionEnum } from "@/constants";
import { useUpdatePost, useUploadMultipleMediaMutation } from "@/hooks";
import type { GetPostItemsType } from "@/models";
import {
  IconCalendar,
  IconCheck,
  IconDots,
  IconEdit,
  IconFlag,
  IconSend2,
  IconShare3,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Camera, Pencil, Trash2, X } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Author = { id: string; name: string; avatar: string; initials: string };

type Props = {
  post: GetPostItemsType;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  currentUserAuthor: Author;
  onReact: (postId: string, type: ReactionEnumType) => void;
  commentValue: string;
  onCommentChange: (postId: string, value: string) => void;
  onCommentSubmit: (postId: string) => void;
  onCommentUpdate?: (commentId: string, content: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onPostDelete?: (postId: string) => void;
};

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

// Helper to render image grid based on count
const ImageGrid = ({
  images,
  onClick,
}: {
  images: string[];
  onClick: (index: number) => void;
}) => {
  const count = images.length;

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div
        className="mb-4 relative w-full max-h-[600px] overflow-hidden rounded-xl cursor-pointer group"
        onClick={() => onClick(0)}
      >
        <Image
          src={images[0]}
          alt="Post image"
          width={800}
          height={600}
          className="w-full h-auto object-contain rounded-xl transition-all group-hover:scale-105"
          style={{ maxHeight: "600px" }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => onClick(idx)}
          >
            <Image
              src={img}
              alt={`Post image ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mb-4 grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => onClick(idx)}
          >
            <Image
              src={img}
              alt={`Post image ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>
        ))}
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => onClick(idx)}
          >
            <Image
              src={img}
              alt={`Post image ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>
        ))}
      </div>
    );
  }

  // 5+ images
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {images.slice(0, 4).map((img, idx) => (
        <div
          key={idx}
          className="relative w-full aspect-square cursor-pointer group overflow-hidden rounded-lg"
          onClick={() => onClick(idx)}
        >
          <Image
            src={img}
            alt={`Post image ${idx + 1}`}
            fill
            style={{ objectFit: "cover" }}
            className="transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {idx === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/80 transition-colors">
              <span className="text-white text-3xl font-bold">
                +{count - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function PostCard({
  post,
  t,
  currentUserAuthor,
  onReact,
  commentValue,
  onCommentChange,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onPostDelete,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content);

  // Image handling states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update post mutation
  const updatePostMutation = useUpdatePost();
  const uploadMediaMutation = useUploadMultipleMediaMutation();

  // Handle image select
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Some files were not images and were skipped");
    }

    // Limit to 10 images total
    const remainingSlots =
      10 - (selectedImages.length + existingImageUrls.length);
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.error("Maximum 10 images allowed per post");
    }

    // Create preview URLs
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...filesToAdd]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Handle remove new image
  const handleRemoveNewImage = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle remove existing image
  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle update post
  const handleUpdatePost = async () => {
    const text = editPostContent.trim();
    if (
      !text &&
      selectedImages.length === 0 &&
      existingImageUrls.length === 0
    ) {
      toast.error("Post must have content or images");
      return;
    }

    setIsUploading(true);

    try {
      let newImageUrls: string[] = [];

      // Upload new images if any
      if (selectedImages.length > 0) {
        const uploadResult = await uploadMediaMutation.mutateAsync({
          files: selectedImages,
          addUniqueName: true,
        });

        if (uploadResult.payload?.data) {
          newImageUrls = uploadResult.payload.data;
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Update post
      await updatePostMutation.mutateAsync({
        id: post.id,
        body: {
          content: text,
          imageUrls: allImageUrls,
        },
      });

      // Reset form and close modal
      setSelectedImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUpdateDialogOpen(false);

      toast.success("Post updated successfully");
    } catch (error: any) {
      console.error("Failed to update post:", error);
      toast.error(error?.message || "Failed to update post");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle open update dialog
  const handleOpenUpdateDialog = () => {
    setEditPostContent(post.content);
    setExistingImageUrls(post.imageUrls || []);
    setSelectedImages([]);
    setPreviewUrls([]);
    setUpdateDialogOpen(true);
  };

  // Play pop sound
  const playPopSound = () => {
    const audio = new Audio("/sounds/pop.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Sound play failed:", err));
  };

  // Handle reaction with sound
  const handleReactionClick = (reactionType: ReactionEnumType) => {
    playPopSound();
    onReact(post.id, reactionType);
  };

  // Calculate time ago
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: vi, // You can detect locale from props if needed
      });
    } catch {
      return "";
    }
  }, [post.createdAt]);

  // Get user's current reaction from myReaction field
  const userReaction = useMemo(() => {
    return post.myReaction;
  }, [post.myReaction]);

  // Calculate total reactions
  const totalReactions = useMemo(() => {
    return post.reactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0;
  }, [post.reactions]);

  // Handle image click - navigate to post detail page
  const handleImageClick = (index: number) => {
    router.push(`/${locale}/social/post/${post.id}?imageIndex=${index}`);
  };

  // check is my post
  const isMyPost = post.isMyPost;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar
              className="h-10 w-10 cursor-pointer ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
              onClick={() =>
                router.push(`/${locale}/matching/${post.creator.id}`)
              }
            >
              <AvatarImage src={post.creator.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {((post.creator as any).name || post.creator.name || "")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <button
                className="font-semibold text-sm md:text-base hover:underline text-left hover:text-primary transition-colors"
                onClick={() =>
                  router.push(`/${locale}/matching/${post.creator.id}`)
                }
              >
                {(post.creator as any).name || post.creator.name || "Unknown"}
              </button>
              <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
            </div>
          </div>

          {isMyPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <IconDots size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenUpdateDialog}>
                  <Pencil />
                  {t("post.update")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="text-red-500" />
                  {t("post.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mb-4 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Shared Post - if this is a shared post */}
        {post.isShare && post.shareType === "Post" && post.sharedPost && (
          <Card className="mb-4 border-2 border-muted hover:border-primary/30 transition-all cursor-pointer">
            <CardContent
              className="p-4"
              onClick={() =>
                router.push(`/${locale}/social/post/${post.sharedPost!.id}`)
              }
            >
              <div className="flex gap-3 mb-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={post.sharedPost.creator.avatarUrl} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-accent">
                    {(post.sharedPost.creator.name || "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {post.sharedPost.creator.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.sharedPost.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-sm mb-3">
                <MarkdownRenderer content={post.sharedPost.content} />
              </div>
              {post.sharedPost.imageUrls &&
                post.sharedPost.imageUrls.length > 0 && (
                  <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={post.sharedPost.imageUrls[0]}
                      alt="Shared post"
                      fill
                      className="object-cover rounded-lg"
                    />
                    {post.sharedPost.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{post.sharedPost.imageUrls.length - 1} more
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Shared Event - if this is a shared event */}
        {post.isShare && post.shareType === "Event" && post.sharedEvent && (
          <Card className="mb-4 border-2 border-muted hover:border-primary/30 transition-all cursor-pointer">
            <CardContent
              className="p-4"
              onClick={() =>
                router.push(`/${locale}/event/${post.sharedEvent!.id}`)
              }
            >
              {post.sharedEvent.bannerUrl && (
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={post.sharedEvent.bannerUrl}
                    alt={post.sharedEvent.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base line-clamp-2 flex-1">
                    {post.sharedEvent.title}
                  </h3>
                  {post.sharedEvent.fee === 0 ? (
                    <Badge className="bg-green-500/90 hover:bg-green-500 text-white text-xs flex-shrink-0">
                      Free
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white text-xs flex-shrink-0">
                      {post.sharedEvent.fee.toLocaleString()} VND
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  <MarkdownRenderer content={post.sharedEvent.description} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconCalendar size={14} />
                    <span>
                      {new Date(post.sharedEvent.startAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.sharedEvent.host.avatarUrl} />
                      <AvatarFallback className="text-[10px]">
                        {(post.sharedEvent.host.name || "")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.sharedEvent.host.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Grid - only show for non-shared posts or if shared post has its own images */}
        {(!post.isShare ||
          (post.isShare && post.imageUrls && post.imageUrls.length > 0)) && (
          <ImageGrid images={post.imageUrls || []} onClick={handleImageClick} />
        )}

        {/* Stats */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.reactions && post.reactions.length > 0 && (
              <>
                <div className="flex -space-x-2 items-center">
                  {post.reactions.slice(0, 3).map((reaction, idx) => (
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
          <button
            className="hover:underline transition-all"
            onClick={() => router.push(`/${locale}/social/post/${post.id}`)}
          >
            {post.commentsCount}{" "}
            {post.commentsCount === 1 ? t("post.comment") : t("post.comments")}
          </button>
        </div>

        <Separator className="mb-3" />

        {/* Reaction Buttons */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex gap-1 flex-wrap">
            {Object.values(ReactionEnum).map((reaction) => (
              <Button
                key={reaction}
                variant={userReaction === reaction ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleReactionClick(reaction)}
                className="px-2 h-9 hover:scale-110 active:scale-95 transition-all"
              >
                {getReactionEmoji(reaction, 20)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare3 size={16} />
              {t("post.share.title")}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <IconFlag size={16} />
              {t("post.report")}
            </Button>
          </div>
        </div>

        {/* Comments */}
        {post.comments && post.comments.length > 0 && (
          <div className="mb-4 space-y-3">
            {post.comments.slice(0, 3).map((c) => {
              const isOwnComment = c.user.id === currentUserAuthor.id;
              const isEditing = editingCommentId === c.id;

              return (
                <div
                  key={c.id}
                  className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarImage src={c.user.avatarUrl} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-accent">
                      {((c.user as any).name || c.user.name || "")
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
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="text-sm h-9"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20"
                          onClick={() => {
                            if (onCommentUpdate && editingContent.trim()) {
                              onCommentUpdate(c.id, editingContent);
                              setEditingCommentId(null);
                              setEditingContent("");
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
                            {(c.user as any).name || c.user.name || "Unknown"}
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
                                  if (onCommentDelete) {
                                    onCommentDelete(c.id);
                                  }
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
            {post.commentsCount > 3 && (
              <button
                className="text-sm font-medium text-primary hover:underline px-3 py-1 rounded-lg hover:bg-primary/5 transition-all"
                onClick={() => router.push(`/${locale}/social/post/${post.id}`)}
              >
                {t("post.viewAllComments", {
                  count: post.commentsCount - 3,
                })}
              </button>
            )}
          </div>
        )}

        {/* Comment Input */}
        <div className="flex gap-2 items-start">
          <Avatar className="h-9 w-9 ring-1 ring-border">
            <AvatarImage src={currentUserAuthor.avatar} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
              {currentUserAuthor.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 gap-2 items-center bg-accent/30 rounded-full px-4 py-2 focus-within:bg-accent/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Input
              placeholder={t("post.commentPlaceholder")}
              value={commentValue}
              onChange={(e) => onCommentChange(post.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onCommentSubmit(post.id);
                }
              }}
              className="border-none bg-transparent focus-visible:ring-0 text-sm h-auto py-0"
            />
            <Button
              size="icon"
              onClick={() => onCommentSubmit(post.id)}
              disabled={!commentValue?.trim()}
              className="h-8 w-8 rounded-full disabled:opacity-50 hover:scale-110 active:scale-95 transition-all"
            >
              <IconSend2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Share Post Dialog */}
      <SharePostDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
        currentUserAuthor={currentUserAuthor}
      />

      {/* Update Post Dialog */}
      <AlertDialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <AlertDialogContent className="sm:max-w-7xl max-h-[95vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl sm:text-2xl">
              {t("post.updatePost")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("post.updatePostDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/10">
                <AvatarImage src={currentUserAuthor.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {currentUserAuthor.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  {currentUserAuthor.name}
                </p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
            </div>

            <MDXEditorWrapper
              value={editPostContent}
              onChange={(value) => setEditPostContent(value)}
              placeholder={t("post.contentPlaceholder")}
              minHeight="250px"
              className="border-0"
            />

            {/* Existing Image Previews */}
            {existingImageUrls.length > 0 && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-accent/30">
                <p className="text-sm font-medium mb-3">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingImageUrls.map((url, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative aspect-square group rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Existing ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {previewUrls.length > 0 && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <p className="text-sm font-medium mb-3 text-green-700 dark:text-green-400">
                  New Images to Upload
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square group rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`New ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex items-center justify-between border rounded-lg p-3 bg-accent/20">
              <p className="text-sm font-medium">Add to your post</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  isUploading ||
                  selectedImages.length + existingImageUrls.length >= 10
                }
                type="button"
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Camera className="h-5 w-5 mr-2" />
                Photo
                {(selectedImages.length > 0 ||
                  existingImageUrls.length > 0) && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {selectedImages.length + existingImageUrls.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading}>
              {t("post.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdatePost}
              disabled={
                isUploading ||
                (!editPostContent.trim() &&
                  selectedImages.length === 0 &&
                  existingImageUrls.length === 0)
              }
            >
              {isUploading ? (
                <>
                  <span className="mr-2">{t("post.updating")}</span>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </>
              ) : (
                t("post.update")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post and all its comments and reactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onPostDelete) {
                  onPostDelete(post.id);
                }
                setDeleteDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
