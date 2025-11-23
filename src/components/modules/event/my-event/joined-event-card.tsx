"use client";

import {
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
  Label,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { useAuthMe } from "@/hooks";
import { formatCurrency } from "@/lib";
import {
  IconCalendar,
  IconClock,
  IconEye,
  IconUserMinus,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

type JoinedEventCardProps = {
  event: {
    id: string;
    title: string;
    description: string;
    bannerUrl: string;
    startAt: string;
    expectedDurationInMinutes: number;
    capacity: number;
    numberOfParticipants: number;
    fee: number;
    host: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    language: {
      name: string;
    };
  };
  onViewDetail?: (eventId: string) => void;
  onUnregister?: (eventId: string, reason: string) => void;
  isUnregistering?: boolean;
};

export function JoinedEventCard({
  event,
  onViewDetail,
  onUnregister,
  isUnregistering = false,
}: JoinedEventCardProps) {
  const t = useTranslations("event.myEvent.joined");
  const tCommon = useTranslations("event");
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
  const [unregisterReason, setUnregisterReason] = useState("");

  const eventStartTime = new Date(event.startAt);
  const now = new Date();
  const hoursUntilEvent =
    (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Can unregister if event is upcoming and more than 24 hours away
  const canUnregister = eventStartTime > now && hoursUntilEvent > 24;
  const isUpcoming = eventStartTime > now;

  const handleUnregisterConfirm = () => {
    if (unregisterReason.trim() && onUnregister) {
      onUnregister(event.id, unregisterReason);
      setShowUnregisterDialog(false);
      setUnregisterReason("");
    }
  };

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const hasBanner = isValidBannerUrl(event.bannerUrl);

  // check isHost
  const me = useAuthMe();
  const isHost = me?.data?.payload.data.id === event.host.id;

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border hover:border-primary/50 flex flex-col h-full">
        {/* Compact Banner */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-muted/20">
          {hasBanner ? (
            <>
              <Image
                src={event.bannerUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconCalendar className="h-10 w-10 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            {event.fee === 0 ? (
              <Badge className="bg-emerald-500 text-white border-0 shadow text-[10px] px-2 py-0.5">
                {tCommon("free")}
              </Badge>
            ) : (
              <Badge className="bg-blue-600 text-white border-0 shadow text-[10px] px-2 py-0.5">
                {formatCurrency(event.fee)}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Compact Title */}
          <div>
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Compact Event Details - Inline */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <IconCalendar className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">
                {format(new Date(event.startAt), "MMM dd")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5 text-blue-500" />
              <span>{event.expectedDurationInMinutes}m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconUsers className="h-3.5 w-3.5 text-green-500" />
              <span>
                {event.numberOfParticipants}/{event.capacity}
              </span>
            </div>
          </div>

          {/* Compact Host & Language */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {event.language.name}
            </Badge>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {event.host.avatarUrl ? (
                  <Image
                    src={event.host.avatarUrl}
                    alt={event.host.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  event.host.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {event.host.name}
              </span>
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex gap-1.5 mt-auto">
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onViewDetail?.(event.id)}
            >
              <IconEye className="h-3.5 w-3.5 mr-1" />
              {t("viewButton")}
            </Button>

            {isUpcoming &&
              onUnregister &&
              !isHost &&
              (canUnregister ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => setShowUnregisterDialog(true)}
                  disabled={isUnregistering}
                >
                  <IconUserMinus className="h-3.5 w-3.5 mr-1" />
                  {t("leaveButton")}
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full h-8 text-xs"
                          disabled
                        >
                          <IconUserMinus className="h-3.5 w-3.5 mr-1" />
                          {t("leaveButton")}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t("cannotUnregister")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Unregister Dialog */}
      <Dialog
        open={showUnregisterDialog}
        onOpenChange={setShowUnregisterDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("unregisterDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("unregisterDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium line-clamp-1">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.startAt), "PPP 'at' p")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">{t("unregisterDialog.reason")}</Label>
              <Textarea
                id="reason"
                placeholder={t("unregisterDialog.reasonPlaceholder")}
                value={unregisterReason}
                onChange={(e) => setUnregisterReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnregisterDialog(false);
                setUnregisterReason("");
              }}
              disabled={isUnregistering}
            >
              {t("unregisterDialog.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnregisterConfirm}
              disabled={!unregisterReason.trim() || isUnregistering}
            >
              {isUnregistering
                ? t("unregisterDialog.unregistering")
                : t("unregisterDialog.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
