"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Smile } from "lucide-react";
import { useState } from "react";

type Author = { name: string; avatar: string; initials: string };
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
  t: ReturnType<typeof import("next-intl").useTranslations>;
  currentUserAuthor: Author;
  onPostCreated: (newPost: Post) => void;
};

export default function CreatePostCard({
  t,
  currentUserAuthor,
  onPostCreated,
}: Props) {
  const [postContent, setPostContent] = useState("");

  const handlePostSubmit = () => {
    const text = postContent.trim();
    if (!text) return;

    const newPost: Post = {
      id: `p${Date.now()}`,
      author: currentUserAuthor,
      timeAgo: t("post.justNow"),
      content: text,
      image: null,
      reactions: { heart: 0, laugh: 0, angry: 0 },
      commentCount: 0,
      comments: [],
    };

    onPostCreated(newPost);
    setPostContent("");
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={currentUserAuthor.avatar} />
            <AvatarFallback>{currentUserAuthor.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Input
              placeholder={t("createPost.placeholder")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostSubmit();
                }
              }}
              className="mb-2 border-none bg-muted text-sm sm:mb-3 sm:text-base"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-0.5 sm:gap-2">
                <Button variant="ghost" size="sm">
                  <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("createPost.photoButton")}
                  </span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("createPost.emojiButton")}
                  </span>
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handlePostSubmit}
                disabled={!postContent.trim()}
              >
                {t("createPost.postButton")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
