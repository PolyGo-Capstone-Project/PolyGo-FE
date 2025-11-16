"use client";

import {
  IconCalendar,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconStar,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  ScrollArea,
  Separator,
  Textarea,
} from "@/components/ui";
import { EventStatus, EventStatusType } from "@/constants";
import { useGetEventStats, useKickParticipantMutation } from "@/hooks";
import { formatCurrency, handleErrorApi, showSuccessToast } from "@/lib";

type EventStatDialogProps = {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventStatDialog({
  eventId,
  open,
  onOpenChange,
}: EventStatDialogProps) {
  const t = useTranslations("event.myEvent.created.stats");
  const tCommon = useTranslations("event.detail");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();

  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [kickReason, setKickReason] = useState("");
  const [allowRejoin, setAllowRejoin] = useState(true);

  const { data, isLoading, error, refetch } = useGetEventStats(
    eventId || "",
    { lang: locale },
    { enabled: !!eventId && open }
  );

  const event = data?.payload?.data;

  const kickParticipantMutation = useKickParticipantMutation({
    onSuccess: () => {
      showSuccessToast(
        data?.payload.message || "Success.KickedFromEvent",
        tSuccess
      );
      setShowKickDialog(false);
      setSelectedParticipant(null);
      setKickReason("");
      setAllowRejoin(true);
      refetch();
    },
    onError: (error) => {
      handleErrorApi({ error, tError });
    },
  });

  const handleKickClick = (participant: { id: string; name: string }) => {
    setSelectedParticipant(participant);
    setShowKickDialog(true);
  };

  const handleKickConfirm = () => {
    if (selectedParticipant && kickReason.trim() && eventId) {
      kickParticipantMutation.mutate({
        eventId,
        userId: selectedParticipant.id,
        reason: kickReason,
        allowRejoin,
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    window.open(`/${locale}/matching/${userId}`, "_blank");
  };

  const isValidUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const hasBanner = event ? isValidUrl(event.bannerUrl) : false;

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

  const canKickParticipants = event?.status === EventStatus.Approved;
  const showPerformanceMetrics = event?.status === EventStatus.Completed;

  const initials = useMemo(() => {
    if (!event) return "";
    return event.host.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [event]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] w-full flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6">
            <DialogTitle className="flex items-center justify-between pr-8">
              {isLoading ? t("title") : event?.title || t("title")}
              {event && getStatusBadge(event.status)}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="px-6 pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error || !event ? (
                <div className="text-center py-12">
                  <p className="text-destructive">
                    {tCommon("errors.loadFailed")}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
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
                  </div>

                  {/* 2-Column Layout: Event Details (Left) | Performance (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Event Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {t("eventDetails")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Host */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage
                              src={
                                isValidUrl(event.host.avatarUrl)
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
                            <p className="text-xs text-muted-foreground">
                              {tCommon("host")}
                            </p>
                            <p className="font-semibold text-sm">
                              {event.host.name}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <IconCalendar className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {tCommon("startTime")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.startAt), "PPPp")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <IconClock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {tCommon("duration")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.expectedDurationInMinutes}{" "}
                                {tCommon("minutes")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <IconMapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {tCommon("language")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.language.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <IconUsers className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {tCommon("capacity")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.numberOfParticipants} / {event.capacity}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Categories */}
                        <div>
                          <p className="text-xs font-medium mb-2">
                            {tCommon("categories")}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {event.categories.map((category, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right Column - Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <IconTrendingUp className="h-5 w-5" />
                          {t("performance")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Revenue */}
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-xs text-muted-foreground mb-1">
                            {t("revenue")}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              event.fee * event.numberOfParticipants
                            )}
                          </p>
                        </div>

                        {showPerformanceMetrics && (
                          <>
                            {/* Average Rating */}
                            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                              <p className="text-xs text-muted-foreground mb-1">
                                {t("averageRating")}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-yellow-600">
                                  {event.averageRating}
                                </p>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <IconStar
                                      key={i}
                                      className={`h-5 w-5 ${
                                        i < Math.floor(event.averageRating || 0)
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Reviews */}
                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <p className="text-xs text-muted-foreground mb-1">
                                {t("reviews")}
                              </p>
                              <p className="text-2xl font-bold text-blue-600">
                                {event.totalReviews}
                              </p>
                            </div>
                          </>
                        )}

                        {!showPerformanceMetrics && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Performance metrics will be available after the
                            event is completed.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Participants List */}
                  {event.participants && event.participants.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {t("participants")} ({event.participants.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {event.participants.map((participant) => (
                              <div
                                key={participant.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      isValidUrl(participant.avatarUrl)
                                        ? participant.avatarUrl!
                                        : undefined
                                    }
                                    alt={participant.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(participant.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {participant.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {t("registeredAt")}:{" "}
                                    {format(
                                      new Date(participant.registeredAt),
                                      "PPp"
                                    )}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewProfile(participant.id)
                                    }
                                  >
                                    <IconUser className="h-4 w-4 mr-1" />
                                    {t("viewProfile")}
                                  </Button>
                                  {canKickParticipants && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleKickClick({
                                          id: participant.id,
                                          name: participant.name,
                                        })
                                      }
                                    >
                                      <IconX className="h-4 w-4 mr-1" />
                                      {t("kick")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Feedback - Only show for Completed events */}
                  {showPerformanceMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {t("recentFeedback")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {event.reviews.length > 0 ? (
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {event.reviews.map((feedback) => (
                                <div
                                  key={feedback.id}
                                  className="p-4 border rounded-lg space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={
                                            feedback.user.avatarUrl ?? undefined
                                          }
                                          alt={feedback.user.name}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {getInitials(feedback.user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <p className="font-medium text-sm">
                                        {feedback.user.name}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <IconStar
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < feedback.rating
                                              ? "fill-yellow-500 text-yellow-500"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {feedback.comment}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(feedback.createdAt),
                                      "PPp"
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {t("noFeedback")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <IconX className="h-4 w-4 mr-2" />
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kick Participant Dialog */}
      <Dialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("kickDialog.title")}</DialogTitle>
            <DialogDescription>{t("kickDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedParticipant && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {selectedParticipant.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="kickReason">{t("kickDialog.reason")}</Label>
              <Textarea
                id="kickReason"
                placeholder={t("kickDialog.reasonPlaceholder")}
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowRejoin"
                checked={allowRejoin}
                onCheckedChange={(checked) =>
                  setAllowRejoin(checked as boolean)
                }
              />
              <Label
                htmlFor="allowRejoin"
                className="text-sm font-normal cursor-pointer"
              >
                {t("kickDialog.allowRejoin")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowKickDialog(false);
                setSelectedParticipant(null);
                setKickReason("");
                setAllowRejoin(true);
              }}
              disabled={kickParticipantMutation.isPending}
            >
              {t("kickDialog.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleKickConfirm}
              disabled={!kickReason.trim() || kickParticipantMutation.isPending}
            >
              {kickParticipantMutation.isPending
                ? t("kickDialog.kicking")
                : t("kickDialog.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
