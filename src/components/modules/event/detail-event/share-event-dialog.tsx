"use client";

import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconCheck,
  IconCopy,
  IconShare,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui";

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventUrl: string;
}

export function ShareEventDialog({
  open,
  onOpenChange,
  eventTitle,
  eventUrl,
}: ShareEventDialogProps) {
  const t = useTranslations("event.detail.share");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: IconBrandFacebook,
      color: "hover:bg-blue-600 hover:text-white",
      onClick: () => {
        // Placeholder for future implementation
        console.log("Share to Facebook");
      },
    },
    {
      name: "Twitter",
      icon: IconBrandTwitter,
      color: "hover:bg-sky-500 hover:text-white",
      onClick: () => {
        // Placeholder for future implementation
        console.log("Share to Twitter");
      },
    },
    {
      name: "LinkedIn",
      icon: IconBrandLinkedin,
      color: "hover:bg-blue-700 hover:text-white",
      onClick: () => {
        // Placeholder for future implementation
        console.log("Share to LinkedIn");
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShare className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

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

          {/* Social Share Section */}
          <div className="space-y-3">
            <Label>{t("shareOn")}</Label>
            <div className="grid grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className={`flex flex-col items-center gap-2 h-auto py-4 transition-colors ${platform.color}`}
                    onClick={platform.onClick}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{platform.name}</span>
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              {t("comingSoon")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
