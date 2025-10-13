"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { MOCK_POSTS } from "@/Data/socialMockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// ******************************************************
// CÁC ĐỊNH NGHĨA TYPE KHÔNG THAY ĐỔI
// ******************************************************
type Author = {
  name: string;
  avatar: string;
  initials: string;
};

type Comment = {
  id: string;
  author: Author;
  content: string;
  timeAgo: string;
};

type Post = {
  id: string;
  author: Author;
  timeAgo: string;
  content: string;
  image: string | null;
  reactions: {
    heart: number;
    laugh: number;
    angry: number;
  };
  commentCount: number;
  comments: Comment[];
};

type ReactionType = "heart" | "laugh" | "angry";

export default function SocialPage() {
  const t = useTranslations("social");
  // SỬA LỖI CÚ PHÁP: Bỏ dấu ngoặc nhọn thừa sau useState
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  const handleReaction = (postId: string, reactionType: ReactionType) => {
    // Logic không thay đổi
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: post.reactions[reactionType] + 1,
            },
          };
        }
        return post;
      })
    );
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: `c${Date.now()}`,
            author: {
              name: "You",
              avatar:
                "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?semt=ais_hybrid&w=740&q=80", // Thay thế avatar cố định
              initials: "YO",
            },
            content: commentText,
            timeAgo: "Just now",
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
            commentCount: post.commentCount + 1,
          };
        }
        return post;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Thay đổi max-w-2xl thành max-w-xl trên mobile, thêm mx-auto để căn giữa */}
      <div className="mx-auto max-w-xl md:max-w-2xl px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Create Post Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src="https://cdn.pixabay.com/photo/2022/03/11/06/14/indian-man-7061278_640.jpg" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Input
                  placeholder={t("createPost.placeholder")}
                  className="mb-2 border-none bg-muted text-sm sm:mb-3 sm:text-base"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-0.5 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-13 gap-1 px-3.5 sm:h-9 sm:gap-2 sm:px-3"
                    >
                      <span className="text-base sm:text-lg">📷</span>
                      <span className="hidden text-sm sm:inline sm:text-base">
                        {t("createPost.photoButton")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-13 gap-1 px-3.5 sm:h-9 sm:gap-2 sm:px-3"
                    >
                      <span className="text-base sm:text-lg">😊</span>
                      <span className="hidden text-sm sm:inline sm:text-base">
                        {t("createPost.emojiButton")}
                      </span>
                    </Button>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto">
                    {t("createPost.postButton")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4 md:space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-3 md:p-4">
                {/* Post Header */}
                <div className="mb-3 md:mb-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 shrink-0">
                      <AvatarImage
                        src={
                          post.author.avatar ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0pQJAwqGzgbLm_UzMY1OaUkTciysLCZJNjg&s"
                        }
                      />
                      <AvatarFallback>{post.author.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-foreground">
                        {post.author.name}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {post.timeAgo}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8"
                      >
                        <span className="text-lg">⋯</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{t("post.report")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Post Content */}
                <p className="mb-3 md:mb-4 text-sm md:text-base text-foreground">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-3 md:mb-4 overflow-hidden rounded-lg relative w-full aspect-[4/3] md:aspect-video">
                    {" "}
                    {/* Thay đổi tỉ lệ ảnh cho mobile */}
                    <Image
                      src={post.image}
                      alt="Post content"
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="rounded-lg"
                    />
                  </div>
                )}

                {/* Reaction Summary */}
                <div className="mb-2 md:mb-3 flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                  <span>
                    ❤️ {post.reactions.heart} {t("post.reactions")}
                  </span>
                  <span>
                    {post.commentCount}{" "}
                    {post.commentCount === 1
                      ? t("post.comment")
                      : t("post.comments")}
                  </span>
                </div>

                <Separator className="mb-2 md:mb-3" />

                {/* Action Buttons */}
                {/* Sử dụng grid/flex-wrap để các nút không bị tràn */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex gap-1 flex-1 min-w-0 justify-around sm:justify-start">
                    {/* Các nút reaction nhỏ hơn trên mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 h-8"
                      onClick={() => handleReaction(post.id, "heart")}
                    >
                      <span className="text-base">❤️</span>
                      {post.reactions.heart > 0 && post.reactions.heart}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 h-8"
                      onClick={() => handleReaction(post.id, "laugh")}
                    >
                      <span className="text-base">😂</span>
                      {post.reactions.laugh > 0 && post.reactions.laugh}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 h-8"
                      onClick={() => handleReaction(post.id, "angry")}
                    >
                      <span className="text-base">😡</span>
                      {post.reactions.angry > 0 && post.reactions.angry}
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-1 justify-around sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-2 h-8"
                    >
                      <span className="text-base">↗️</span>
                      <span className="hidden sm:inline">
                        {t("post.share")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-2 h-8"
                    >
                      <span className="text-base">🚩</span>
                      <span className="hidden sm:inline">
                        {t("post.report")}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="mb-3 md:mb-4 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage
                            src={
                              comment.author.avatar ||
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0pQJAwqGzgbLm_UzMY1OaUkTciysLCZJNjg&s"
                            }
                          />
                          <AvatarFallback>
                            {comment.author.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="rounded-lg bg-muted p-2 md:p-3">
                            <p className="text-xs md:text-sm font-semibold text-foreground">
                              {comment.author.name}
                            </p>
                            <p className="text-xs md:text-sm text-foreground break-words">
                              {comment.content}
                            </p>
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                            <span>{comment.timeAgo}</span>
                            <button className="hover:underline">
                              {t("post.reply")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?semt=ais_hybrid&w=740&q=80" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 gap-2">
                    <Input
                      placeholder={t("post.commentPlaceholder")}
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(post.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleCommentSubmit(post.id);
                        }
                      }}
                      className="flex-1 h-9"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <span className="text-base">➤</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
