"use client";

import {
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
  Separator,
} from "@/components";
import type { ReactionEnumType } from "@/constants";
import { ReactionEnum } from "@/constants";
import type { GetPostItemsType } from "@/models";
import {
  IconCheck,
  IconDots,
  IconEdit,
  IconFlag,
  IconHeart,
  IconMoodAngry,
  IconMoodHappy,
  IconMoodSad,
  IconMoodSmile,
  IconSend2,
  IconShare3,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
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
};

// Helper to get reaction icon and color
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
        className="mb-3 relative w-full aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
        onClick={() => onClick(0)}
      >
        <Image
          src={images[0]}
          alt="Post image"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-lg hover:opacity-95 transition-opacity"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square cursor-pointer"
            onClick={() => onClick(idx)}
          >
            <Image
              src={img}
              alt={`Post image ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="hover:opacity-95 transition-opacity"
            />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        <div
          className="relative aspect-square cursor-pointer"
          onClick={() => onClick(0)}
        >
          <Image
            src={images[0]}
            alt="Post image 1"
            fill
            style={{ objectFit: "cover" }}
            className="hover:opacity-95 transition-opacity"
          />
        </div>
        <div className="grid grid-rows-2 gap-1">
          {images.slice(1, 3).map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square cursor-pointer"
              onClick={() => onClick(idx + 1)}
            >
              <Image
                src={img}
                alt={`Post image ${idx + 2}`}
                fill
                style={{ objectFit: "cover" }}
                className="hover:opacity-95 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square cursor-pointer"
            onClick={() => onClick(idx)}
          >
            <Image
              src={img}
              alt={`Post image ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="hover:opacity-95 transition-opacity"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5+ images
  return (
    <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
      {images.slice(0, 4).map((img, idx) => (
        <div
          key={idx}
          className="relative aspect-square cursor-pointer"
          onClick={() => onClick(idx)}
        >
          <Image
            src={img}
            alt={`Post image ${idx + 1}`}
            fill
            style={{ objectFit: "cover" }}
            className="hover:opacity-95 transition-opacity"
          />
          {idx === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
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
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

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

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar
              className="h-9 w-9 cursor-pointer"
              onClick={() =>
                router.push(`/${locale}/matching/${post.creator.id}`)
              }
            >
              <AvatarImage src={post.creator.avatarUrl} />
              <AvatarFallback>
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
                className="font-semibold text-sm md:text-base hover:underline text-left"
                onClick={() =>
                  router.push(`/${locale}/matching/${post.creator.id}`)
                }
              >
                {(post.creator as any).name || post.creator.name || "Unknown"}
              </button>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDots size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t("post.report")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="mb-3 text-sm md:text-base whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Images Grid */}
        <ImageGrid images={post.imageUrls || []} onClick={handleImageClick} />

        {/* Stats */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {post.reactions && post.reactions.length > 0 && (
              <>
                <div className="flex -space-x-1">
                  {post.reactions.slice(0, 3).map((reaction, idx) => (
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
            {post.commentsCount === 1 ? t("post.comment") : t("post.comments")}
          </span>
        </div>

        <Separator className="mb-3" />

        {/* Reaction Buttons */}
        <div className="mb-4 flex justify-between flex-wrap gap-2">
          <div className="flex gap-1">
            {Object.values(ReactionEnum).map((reaction) => (
              <Button
                key={reaction}
                variant={userReaction === reaction ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onReact(post.id, reaction)}
                className="px-2"
              >
                {getReactionIcon(reaction, 18)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <IconShare3 size={18} className="mr-1" />
              {t("post.share")}
            </Button>
            <Button variant="ghost" size="sm">
              <IconFlag size={18} className="mr-1" />
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
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={c.user.avatarUrl} />
                    <AvatarFallback>
                      {((c.user as any).name || c.user.name || "")
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
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="text-xs"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
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
                          className="h-8 w-8"
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
                        <div className="bg-muted rounded-lg p-2 group relative">
                          <p className="text-xs font-semibold">
                            {(c.user as any).name || c.user.name || "Unknown"}
                          </p>
                          <p className="text-xs break-words">{c.content}</p>
                          {isOwnComment && (
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
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
                                className="h-6 w-6"
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
            {post.commentsCount > 3 && (
              <button
                className="text-xs text-muted-foreground hover:underline"
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
        <div className="flex gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={currentUserAuthor.avatar} />
            <AvatarFallback>{currentUserAuthor.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 gap-2">
            <Input
              placeholder={t("post.commentPlaceholder")}
              value={commentValue}
              onChange={(e) => onCommentChange(post.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onCommentSubmit(post.id);
                }
              }}
            />
            <Button
              size="icon"
              onClick={() => onCommentSubmit(post.id)}
              disabled={!commentValue?.trim()}
            >
              <IconSend2 size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
