"use client";

import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconEye,
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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge(event.status)}
          </div>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCalendar className="size-4" />
              <span>{format(new Date(event.startAt), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="size-4" />
              <span>{event.expectedDurationInMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconUsers className="size-4" />
              <span>
                {event.numberOfParticipants}/{event.capacity} participants
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{event.language.name}</Badge>
              <Badge variant="secondary">
                {event.fee === 0 ? "Free" : formatCurrency(event.fee)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetail?.(event.id)}
            >
              <IconEye className="size-4 mr-1" />
              {t("viewDetail")}
            </Button>
            {canEdit && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onEdit?.(event.id)}
              >
                <IconEdit className="size-4 mr-1" />
                {t("edit")}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
              >
                <IconX className="size-4 mr-1" />
                {t("cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
