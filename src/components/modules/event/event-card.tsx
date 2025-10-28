"use client";

import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Badge, Button, Card, CardContent } from "@/components/ui";
import { PlanTypeEnumType } from "@/constants";

type EventCardProps = {
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
    planType: PlanTypeEnumType;
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
};

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("event");
  const locale = useLocale();

  const spotsLeft = event.capacity - event.numberOfParticipants;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={event.bannerUrl || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {event.fee === 0 ? (
            <Badge variant="secondary" className="bg-green-500 text-white">
              {t("free")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-500 text-white">
              ${event.fee}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={event.host.avatarUrl || "/default-avatar.png"}
              alt={event.host.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{event.host.name}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(event.startAt), "PPP")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconClock className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.expectedDurationInMinutes} {t("detail.minutes")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconUsers className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.numberOfParticipants}/{event.capacity} {t("participants")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconMapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.language.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {event.categories.slice(0, 3).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category.name}
            </Badge>
          ))}
          {event.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{event.categories.length - 3}
            </Badge>
          )}
        </div>

        <Link href={`/${locale}/event/${event.id}`} className="block">
          <Button
            className="w-full"
            variant={isFull ? "secondary" : "default"}
            disabled={isFull}
          >
            {isFull ? t("capacity") : t("viewDetails")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
