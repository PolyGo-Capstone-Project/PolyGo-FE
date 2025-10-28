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

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib";
import { useMemo } from "react";

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
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;

  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const initials = useMemo(() => {
    return event.host.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [event.host.name]);

  const hasBanner = isValidBannerUrl(event.bannerUrl);

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-muted/40 flex flex-col h-full">
      {/* Banner Section */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        {hasBanner ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <IconCalendar className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground/50">
                {event.title}
              </p>
            </div>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {event.fee === 0 ? (
            <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0 shadow-lg backdrop-blur-sm">
              {t("free")}
            </Badge>
          ) : (
            <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 shadow-lg backdrop-blur-sm">
              {formatCurrency(event.fee)}
            </Badge>
          )}
          {isAlmostFull && (
            <Badge className="bg-orange-500/90 hover:bg-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              {spotsLeft} {t("spotsLeft")}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Title & Description */}
        <div className="space-y-2 flex-1">
          <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {event.description}
          </p>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-11 w-11 border-2 border-primary/10 shadow-sm">
            <AvatarImage
              src={
                isValidAvatarUrl(event.host.avatarUrl)
                  ? event.host.avatarUrl!
                  : undefined
              }
              alt={event.host.name}
            />
            <AvatarFallback className="text-sm font-semibold bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{t("hostedBy")}</p>
            <p className="text-sm font-semibold truncate">{event.host.name}</p>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-3 py-2 border-y border-muted/30">
          <div className="flex items-start gap-2">
            <IconCalendar className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("date")}</p>
              <p className="text-sm font-medium truncate">
                {format(new Date(event.startAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <IconClock className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("duration")}</p>
              <p className="text-sm font-medium">
                {event.expectedDurationInMinutes} {t("detail.minutes")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <IconUsers className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {t("participants")}
              </p>
              <p className="text-sm font-medium">
                {event.numberOfParticipants}/{event.capacity}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <IconMapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("language")}</p>
              <p className="text-sm font-medium truncate">
                {event.language.name}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {event.categories.slice(0, 3).map((category, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs font-normal"
            >
              {category.name}
            </Badge>
          ))}
          {event.categories.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{event.categories.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Button - Always at bottom */}
        <Link href={`/${locale}/event/${event.id}`} className="block mt-auto">
          <Button
            className="w-full"
            variant={isFull ? "secondary" : "default"}
            disabled={isFull}
            size="lg"
          >
            {isFull ? t("capacity") : t("viewDetails")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
