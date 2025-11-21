"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  MDXEditorWrapper,
  MarkdownRenderer,
} from "@/components";
import { ShareEnum } from "@/constants";
import { useSharePost } from "@/hooks";
import type { GetPostItemsType } from "@/models";
import { IconLoader2, IconShare } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface SharePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: GetPostItemsType;
  currentUserAuthor: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
}

export function SharePostDialog({
  open,
  onOpenChange,
  post,
  currentUserAuthor,
}: SharePostDialogProps) {
  const t = useTranslations("social.post.share");
  const [shareContent, setShareContent] = useState("");
  const sharePostMutation = useSharePost();

  const handleShare = async () => {
    try {
      const id = post.isShare ? post.sharedPostId! : post.id;
      await sharePostMutation.mutateAsync({
        shareType: ShareEnum.Post,
        targetId: id,
        content: shareContent.trim() || "",
      });

      toast.success(t("success"));
      setShareContent("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to share post:", error);
      toast.error(error?.message || t("error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShare className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
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

          {/* Share Content Input */}
          <MDXEditorWrapper
            value={shareContent}
            onChange={(value) => setShareContent(value)}
            placeholder={t("contentPlaceholder")}
            minHeight="150px"
            className="border-0"
          />

          {/* Original Post Preview */}
          <Card className="border-2 border-muted">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={post.creator.avatarUrl} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-accent">
                    {(post.creator.name || "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{post.creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Original Content */}
              <div className="text-sm mb-3">
                <MarkdownRenderer content={post.content} />
              </div>

              {/* Original Images (show first image only if multiple) */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="relative w-full max-h-[200px] overflow-hidden rounded-lg">
                  <Image
                    src={post.imageUrls[0]}
                    alt="Post preview"
                    width={400}
                    height={200}
                    className="w-full h-auto object-cover rounded-lg"
                    style={{ maxHeight: "200px" }}
                  />
                  {post.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      +{post.imageUrls.length - 1} more
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sharePostMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleShare}
            disabled={sharePostMutation.isPending}
            className="gap-2"
          >
            {sharePostMutation.isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                {t("sharing")}
              </>
            ) : (
              <>
                <IconShare className="h-4 w-4" />
                {t("shareButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
