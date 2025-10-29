"use client";

import {
  IconCalendar,
  IconClock,
  IconEye,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Badge, Button, Card, CardContent } from "@/components/ui";
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
};

export function JoinedEventCard({ event, onViewDetail }: JoinedEventCardProps) {
  const t = useTranslations("event.myEvent.joined");

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={event.bannerUrl}
          alt={event.title}
          fill
          className="object-cover"
        />
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

        <div className="text-sm text-muted-foreground">
          Hosted by {event.host.name}
        </div>

        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => onViewDetail?.(event.id)}
        >
          <IconEye className="size-4 mr-1" />
          {t("viewDetail")}
        </Button>
      </CardContent>
    </Card>
  );
}
