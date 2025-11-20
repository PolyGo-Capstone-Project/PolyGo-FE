"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  MDXEditorWrapper,
} from "@/components";
import { ShareEnum } from "@/constants";
import { useSharePost } from "@/hooks";
import { useAuthMe } from "@/hooks/query/use-auth";
import {
  IconCheck,
  IconCopy,
  IconLoader2,
  IconShare,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventUrl: string;
  eventId?: string;
  eventData?: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    fee: number;
    bannerUrl?: string;
  };
}

export function ShareEventDialog({
  open,
  onOpenChange,
  eventTitle,
  eventUrl,
  eventId,
  eventData,
}: ShareEventDialogProps) {
  const t = useTranslations("event.detail.share");
  const tPost = useTranslations("social.post.share");
  const [copied, setCopied] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [showShareOnSocial, setShowShareOnSocial] = useState(false);

  const { data: userData } = useAuthMe();
  const sharePostMutation = useSharePost();

  const currentUser = useMemo(() => userData?.payload?.data, [userData]);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShareOnSocial = async () => {
    if (!eventId || !currentUserAuthor) {
      toast.error(tPost("error"));
      return;
    }

    try {
      await sharePostMutation.mutateAsync({
        shareType: ShareEnum.Event,
        targetId: eventId,
        content: shareContent.trim() || "",
      });

      toast.success(tPost("success"));
      setShareContent("");
      setShowShareOnSocial(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || tPost("error"));
    }
  };

  const isValidBannerUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          setShowShareOnSocial(false);
          setShareContent("");
        }
      }}
    >
      <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShare className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {!showShareOnSocial ? (
          <div className="space-y-4 pt-4">
            {/* Copy Link Section */}
            <div className="space-y-2">
              <Label htmlFor="event-url">{t("copyLink")}</Label>
              <div className="flex gap-2">
                <Input
                  id="event-url"
                  value={eventUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant={copied ? "default" : "outline"}
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 font-medium">
                  {t("copied")}
                </p>
              )}
            </div>

            {/* Share on Social Media Section */}
            {eventId && (
              <div className="space-y-3">
                <Label>{t("shareOn")}</Label>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center justify-center gap-2"
                  onClick={() => setShowShareOnSocial(true)}
                >
                  <IconShare className="h-5 w-5" />
                  <span className="font-medium">{t("shareOnSocial")}</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Info */}
            {currentUserAuthor && (
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
            )}

            {/* Share Content Input */}
            <MDXEditorWrapper
              value={shareContent}
              onChange={(value) => setShareContent(value)}
              placeholder={tPost("contentPlaceholder")}
              minHeight="150px"
              className="border-0"
            />

            {/* Event Preview */}
            {eventData && (
              <Card className="border-2 border-muted">
                <CardContent className="p-4">
                  {/* Event Banner */}
                  {isValidBannerUrl(eventData.bannerUrl) && (
                    <div className="relative w-full h-[150px] rounded-lg overflow-hidden mb-3">
                      <Image
                        src={eventData.bannerUrl!}
                        alt={eventData.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base line-clamp-2">
                      {eventData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {eventData.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(eventData.startAt), "PPP")}</span>
                      <span>•</span>
                      {eventData.fee === 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          Free
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {eventData.fee.toLocaleString()} VND
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {showShareOnSocial && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowShareOnSocial(false);
                setShareContent("");
              }}
              disabled={sharePostMutation.isPending}
            >
              {tPost("cancel")}
            </Button>
            <Button
              onClick={handleShareOnSocial}
              disabled={sharePostMutation.isPending}
              className="gap-2"
            >
              {sharePostMutation.isPending ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  {tPost("sharing")}
                </>
              ) : (
                <>
                  <IconShare className="h-4 w-4" />
                  {tPost("shareButton")}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
