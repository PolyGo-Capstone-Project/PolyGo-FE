"use client";

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
import { formatCurrency } from "@/lib";

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

  // Can unregister if event is upcoming and more than 6 hours away
  const canUnregister = eventStartTime > now && hoursUntilEvent > 6;
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

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          {hasBanner ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconCalendar className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            {event.fee === 0 ? (
              <Badge className="bg-green-500/90 text-white border-0 shadow-lg">
                {tCommon("free")}
              </Badge>
            ) : (
              <Badge className="bg-blue-500/90 text-white border-0 shadow-lg">
                {formatCurrency(event.fee)}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Title & Description */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCalendar className="size-4 flex-shrink-0 text-primary" />
              <span>{format(new Date(event.startAt), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="size-4 flex-shrink-0 text-primary" />
              <span>{event.expectedDurationInMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconUsers className="size-4 flex-shrink-0 text-primary" />
              <span>
                {event.numberOfParticipants}/{event.capacity} participants
              </span>
            </div>
          </div>

          {/* Language & Host */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline">{event.language.name}</Badge>
            <p className="text-sm text-muted-foreground">
              Hosted by {event.host.name}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetail?.(event.id)}
            >
              <IconEye className="size-4 mr-1" />
              {t("viewDetail")}
            </Button>

            {isUpcoming &&
              onUnregister &&
              (canUnregister ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowUnregisterDialog(true)}
                  disabled={isUnregistering}
                >
                  <IconUserMinus className="size-4 mr-1" />
                  {t("unregister")}
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled
                        >
                          <IconUserMinus className="size-4 mr-1" />
                          {t("unregister")}
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
