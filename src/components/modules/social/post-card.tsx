"use client";

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
import Image from "next/image";

type Author = { name: string; avatar: string; initials: string };
type ReactionType = "heart" | "laugh" | "angry";
type Post = {
  id: string;
  author: Author;
  timeAgo: string;
  content: string;
  image: string | null;
  reactions: { heart: number; laugh: number; angry: number };
  commentCount: number;
  comments: { id: string; author: Author; content: string; timeAgo: string }[];
};

type Props = {
  post: Post;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  currentUserAuthor: Author;
  onReact: (postId: string, type: ReactionType) => void;
  commentValue: string;
  onCommentChange: (postId: string, value: string) => void;
  onCommentSubmit: (postId: string) => void;
};

export default function PostCard({
  post,
  t,
  currentUserAuthor,
  onReact,
  commentValue,
  onCommentChange,
  onCommentSubmit,
}: Props) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm md:text-base">
                {post.author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {post.timeAgo} {t("onlineTime")}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t("post.report")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mb-3 text-sm md:text-base">{post.content}</p>

        {post.image && (
          <div className="mb-3 relative w-full aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt="Post content"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
        )}

        <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            ❤️ {post.reactions.heart} {t("post.reactions")}
          </span>
          <span>
            {post.commentCount}{" "}
            {post.commentCount === 1 ? t("post.comment") : t("post.comments")}
          </span>
        </div>

        <Separator className="mb-3" />

        <div className="mb-4 flex justify-between flex-wrap">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact(post.id, "heart")}
            >
              ❤️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact(post.id, "laugh")}
            >
              😂
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact(post.id, "angry")}
            >
              😡
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              ↗️ {t("post.share")}
            </Button>
            <Button variant="ghost" size="sm">
              🚩 {t("post.report")}
            </Button>
          </div>
        </div>

        {post.comments.length > 0 && (
          <div className="mb-4 space-y-3">
            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.author.avatar} />
                  <AvatarFallback>{c.author.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs font-semibold">{c.author.name}</p>
                    <p className="text-xs break-words">{c.content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                    <span>{c.timeAgo}</span>
                    <button className="hover:underline">
                      {t("post.reply")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
              ➤
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
