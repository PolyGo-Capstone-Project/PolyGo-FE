"use client";

import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Separator,
  Skeleton,
} from "@/components/ui";
import { EventStatus } from "@/constants";
import { useGetEventDetail } from "@/hooks/query/use-event";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

type EventDetailDialogProps = {
  eventId: string;
};

export function EventDetailDialog({ eventId }: EventDetailDialogProps) {
  const t = useTranslations("admin.events.detail");
  const tStatus = useTranslations("admin.events.status");
  const locale = useLocale();

  const { data, isLoading, isError } = useGetEventDetail(eventId, {
    lang: locale,
  });

  const event = data?.payload?.data;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case EventStatus.Approved:
        return "default";
      case EventStatus.Pending:
        return "secondary";
      case EventStatus.Rejected:
        return "destructive";
      case EventStatus.Live:
        return "default";
      case EventStatus.Cancelled:
        return "outline";
      case EventStatus.Completed:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("viewDetails")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError || !event ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{t("loadError")}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Banner */}
              {event.bannerUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={event.bannerUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                    layout="fill"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold">{event.title}</h2>
                  <Badge variant={getStatusBadgeVariant(event.status)}>
                    {tStatus(event.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{event.description}</p>
              </div>

              <Separator />

              {/* Event Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Host */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconUsers className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("host")}</p>
                    <p className="font-medium">{event.host.name}</p>
                  </div>
                </div>

                {/* Language */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconMapPin className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("language")}
                    </p>
                    <p className="font-medium">{event.language.name}</p>
                  </div>
                </div>

                {/* Start Time */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconCalendar className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("startTime")}
                    </p>
                    <p className="font-medium">
                      {formatDateTime(event.startAt, locale)}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconClock className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("duration")}
                    </p>
                    <p className="font-medium">
                      {event.expectedDurationInMinutes} {t("minutes")}
                    </p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconUsers className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("capacity")}
                    </p>
                    <p className="font-medium">
                      {event.numberOfParticipants} / {event.capacity}
                    </p>
                  </div>
                </div>

                {/* Fee */}
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <IconClock className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fee")}</p>
                    <p className="font-medium">
                      {event.fee === 0
                        ? t("free")
                        : formatCurrency(event.fee, locale)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {event.categories && event.categories.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t("categories")}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Participants List */}
              {event.participants && event.participants.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      {t("participants")} ({event.participants.length})
                    </p>
                    <div className="space-y-2">
                      {event.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 overflow-hidden rounded-full bg-muted">
                              {participant.avatarUrl ? (
                                <Image
                                  src={participant.avatarUrl}
                                  alt={participant.name}
                                  className="h-full w-full object-cover"
                                  layout="fill"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm">
                                  {participant.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {t("registeredAt")}:{" "}
                                {formatDateTime(
                                  participant.registeredAt,
                                  locale
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {participant.role === "0"
                              ? t("roleHost")
                              : t("roleAttendee")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
