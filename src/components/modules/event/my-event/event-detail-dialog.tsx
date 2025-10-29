"use client";

import {
  IconCalendar,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Separator,
} from "@/components/ui";
import { EventStatus, EventStatusType } from "@/constants";
import { useGetEventDetail } from "@/hooks";
import { formatCurrency } from "@/lib";

type EventDetailDialogProps = {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  const t = useTranslations("event.detail");
  const tMyEvent = useTranslations("event.myEvent.created");
  const locale = useLocale();

  const { data, isLoading, error } = useGetEventDetail(
    eventId || "",
    { lang: locale },
    { enabled: !!eventId && open }
  );

  const event = data?.payload?.data;

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const initials = useMemo(() => {
    if (!event) return "";
    return event.host.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [event?.host.name]);

  const hasBanner = event ? isValidBannerUrl(event.bannerUrl) : false;

  const getStatusBadge = (status: EventStatusType) => {
    const statusConfig: Record<
      EventStatusType,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      [EventStatus.Pending]: { variant: "outline", label: "Pending" },
      [EventStatus.Approved]: { variant: "default", label: "Approved" },
      [EventStatus.Rejected]: { variant: "destructive", label: "Rejected" },
      [EventStatus.Live]: { variant: "default", label: "Live" },
      [EventStatus.Cancelled]: { variant: "destructive", label: "Cancelled" },
      [EventStatus.Completed]: { variant: "secondary", label: "Completed" },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] w-full flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6">
          <DialogTitle className="flex items-center justify-between pr-8">
            {isLoading ? t("title") : event?.title || t("title")}
            {event && getStatusBadge(event.status)}
          </DialogTitle>
          {event && <DialogDescription>{event.description}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error || !event ? (
              <div className="text-center py-12">
                <p className="text-destructive">{t("errors.loadFailed")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Banner */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                  {hasBanner ? (
                    <Image
                      src={event.bannerUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconCalendar className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {event.fee === 0 ? (
                      <Badge className="bg-green-500/90 text-white shadow-lg">
                        {t("free")}
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/90 text-white shadow-lg">
                        {formatCurrency(event.fee)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage
                      src={
                        isValidAvatarUrl(event.host.avatarUrl)
                          ? event.host.avatarUrl!
                          : undefined
                      }
                      alt={event.host.name}
                    />
                    <AvatarFallback className="font-semibold bg-primary/10">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("host")}</p>
                    <p className="font-semibold">{event.host.name}</p>
                  </div>
                </div>

                <Separator />

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <IconCalendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("startTime")}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startAt), "PPPp")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconClock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("duration")}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.expectedDurationInMinutes} {t("minutes")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconMapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("language")}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.language.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconUsers className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("capacity")}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.numberOfParticipants} / {event.capacity}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <p className="font-semibold mb-3">{t("categories")}</p>
                  <div className="flex flex-wrap gap-2">
                    {event.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Participants List (if available) */}
                {event.participants && event.participants.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-semibold mb-3">
                        {tMyEvent("participants")} ({event.participants.length})
                      </p>
                      <ScrollArea className="max-h-64 border rounded-lg p-4">
                        <div className="space-y-3">
                          {event.participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-3"
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={
                                    isValidAvatarUrl(participant.avatarUrl)
                                      ? participant.avatarUrl!
                                      : undefined
                                  }
                                  alt={participant.name}
                                />
                                <AvatarFallback>
                                  {participant.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {participant.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(participant.registeredAt),
                                    "PPp"
                                  )}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {participant.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <IconX className="h-4 w-4 mr-2" />
            {tMyEvent("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
