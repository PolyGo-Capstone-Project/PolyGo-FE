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
} from "@/components/ui";
import { EventStatus, EventStatusType } from "@/constants";
import { formatCurrency } from "@/lib";
import {
  IconCalendar,
  IconChartBar,
  IconClock,
  IconEdit,
  IconEye,
  IconLanguage,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

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
    host: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
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
  onViewStats?: (eventId: string) => void;
  isCancelling?: boolean;
};

export function CreatedEventCard({
  event,
  onEdit,
  onCancel,
  onViewDetail,
  onViewStats,
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
      [EventStatus.Pending]: {
        variant: "outline",
        label: tCommon("status.pending"),
      },
      [EventStatus.Approved]: {
        variant: "default",
        label: tCommon("status.approved"),
      },
      [EventStatus.Rejected]: {
        variant: "destructive",
        label: tCommon("status.rejected"),
      },
      [EventStatus.Live]: { variant: "default", label: tCommon("status.live") },
      [EventStatus.Cancelled]: {
        variant: "destructive",
        label: tCommon("status.cancelled"),
      },
      [EventStatus.Completed]: {
        variant: "secondary",
        label: tCommon("status.completed"),
      },
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
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border hover:border-primary/50 flex flex-col h-full">
        {/* Compact Banner Section */}
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

          {/* Compact Badges */}
          <div className="absolute top-2 right-2 flex flex-wrap gap-1.5 z-10 max-w-[60%] justify-end">
            {getStatusBadge(event.status)}
            {event.fee === 0 ? (
              <Badge className="bg-emerald-500 text-white border-0 shadow text-[10px] px-2 py-0.5">
                {tCommon("free")}
              </Badge>
            ) : (
              <Badge className="bg-blue-600 text-white border-0 shadow text-[10px] px-2 py-0.5">
                {formatCurrency(event.fee)}
              </Badge>
            )}
            {isAlmostFull && (
              <Badge className="bg-orange-500 text-white border-0 shadow text-[10px] px-2 py-0.5">
                {spotsLeft} {tCommon("spotsLeft")}
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
            <div className="flex items-center gap-1.5">
              <IconLanguage className="h-3.5 w-3.5 text-purple-500" />
              <span className="truncate max-w-[80px]">
                {event.language.name}
              </span>
            </div>
          </div>

          {/* Event Category and Host Info */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
            {/* Compact Categories */}
            {event.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.categories.slice(0, 2).map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5"
                  >
                    {category.name}
                  </Badge>
                ))}
                {event.categories.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5"
                  >
                    +{event.categories.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Host info */}
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

          {/* Event description */}
          <div className="pt-1 border-t border-border/30">
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 overflow-hidden break-words">
                {event.description}
              </p>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mt-auto">
            <Button
              size="sm"
              onClick={() => onViewDetail?.(event.id)}
              className="h-8 text-xs"
            >
              <IconEye className="h-3.5 w-3.5 mr-1" />
              {t("viewDetail")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStats?.(event.id)}
              className="h-8 text-xs"
            >
              <IconChartBar className="h-3.5 w-3.5 mr-1" />
              {t("viewStats")}
            </Button>
            {canEdit && onEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onEdit(event.id)}
                className="h-8 text-xs"
              >
                <IconEdit className="h-3.5 w-3.5 mr-1" />
                {t("edit")}
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
                className="h-8 text-xs"
              >
                <IconX className="h-3.5 w-3.5 mr-1" />
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
