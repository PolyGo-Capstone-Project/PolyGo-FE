"use client";

import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconEye,
  IconMapPin,
  IconUsers,
  IconX,
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
} from "@/components/ui";
import { EventStatus, EventStatusType } from "@/constants";
import { formatCurrency } from "@/lib";

type CreatedEventCardProps = {
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
    status: EventStatusType;
    language: {
      name: string;
    };
    categories: Array<{
      name: string;
    }>;
  };
  onEdit?: (eventId: string) => void;
  onCancel?: (eventId: string, reason: string) => void;
  onViewDetail?: (eventId: string) => void;
  isCancelling?: boolean;
};

export function CreatedEventCard({
  event,
  onEdit,
  onCancel,
  onViewDetail,
  isCancelling = false,
}: CreatedEventCardProps) {
  const t = useTranslations("event.myEvent.created");
  const tCommon = useTranslations("event");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const canEdit = event.status === EventStatus.Pending;
  const canCancel =
    event.status === EventStatus.Pending ||
    event.status === EventStatus.Approved;

  const handleCancelConfirm = () => {
    if (cancelReason.trim() && onCancel) {
      onCancel(event.id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason("");
    }
  };

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

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const hasBanner = isValidBannerUrl(event.bannerUrl);
  const spotsLeft = event.capacity - event.numberOfParticipants;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-muted/40 flex flex-col h-full">
        {/* Banner Section */}
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

          {/* Badges Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {getStatusBadge(event.status)}
            {event.fee === 0 ? (
              <Badge className="bg-green-500/90 text-white border-0 shadow-lg">
                {tCommon("free")}
              </Badge>
            ) : (
              <Badge className="bg-blue-500/90 text-white border-0 shadow-lg">
                {formatCurrency(event.fee)}
              </Badge>
            )}
            {isAlmostFull && (
              <Badge className="bg-orange-500/90 text-white border-0 shadow-lg">
                {spotsLeft} {tCommon("spotsLeft")}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Title & Description */}
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-muted/30">
            <div className="flex items-start gap-2">
              <IconCalendar className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tCommon("date")}
                </p>
                <p className="text-sm font-medium truncate">
                  {format(new Date(event.startAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <IconClock className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tCommon("duration")}
                </p>
                <p className="text-sm font-medium">
                  {event.expectedDurationInMinutes} {tCommon("detail.minutes")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <IconUsers className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tCommon("participants")}
                </p>
                <p className="text-sm font-medium">
                  {event.numberOfParticipants}/{event.capacity}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <IconMapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tCommon("language")}
                </p>
                <p className="text-sm font-medium truncate">
                  {event.language.name}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {event.categories.slice(0, 2).map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs font-normal"
              >
                {category.name}
              </Badge>
            ))}
            {event.categories.length > 2 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{event.categories.length - 2}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => onViewDetail?.(event.id)}
            >
              <IconEye className="h-4 w-4 mr-1" />
              {t("viewDetail")}
            </Button>
            {canEdit && onEdit && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 min-w-[100px]"
                onClick={() => onEdit(event.id)}
              >
                <IconEdit className="h-4 w-4 mr-1" />
                {t("edit")}
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 min-w-[100px]"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
              >
                <IconX className="h-4 w-4 mr-1" />
                {t("cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("cancelDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">{t("cancelDialog.reason")}</Label>
              <Textarea
                id="reason"
                placeholder={t("cancelDialog.reasonPlaceholder")}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason("");
              }}
              disabled={isCancelling}
            >
              {t("cancelDialog.cancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || isCancelling}
            >
              {isCancelling
                ? t("cancelDialog.cancelling")
                : t("cancelDialog.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
