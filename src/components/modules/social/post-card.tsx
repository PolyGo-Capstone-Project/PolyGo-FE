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
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  MarkdownRenderer,
  Separator,
} from "@/components";
import type { ReactionEnumType } from "@/constants";
import { ReactionEnum } from "@/constants";
import { useAuthMe } from "@/hooks";
import type { GetPostItemsType } from "@/models";
import {
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
import { Trash2 } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // My Post
  // check is my post
  const me = useAuthMe();
  const isMyPost = me.data?.payload.data.id === post.creator.id;

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

        {/* Images Grid */}
        <ImageGrid images={post.imageUrls || []} onClick={handleImageClick} />

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
            <Button variant="ghost" size="sm" className="gap-1">
              <IconShare3 size={16} />
              {t("post.share")}
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
