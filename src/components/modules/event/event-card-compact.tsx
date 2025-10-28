"use client";

import { IconCalendar, IconClock, IconUsers } from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Badge, Card } from "@/components/ui";
import { PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib";

type EventCardCompactProps = {
  event: {
    id: string;
    title: string;
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
  };
};

export function EventCardCompact({ event }: EventCardCompactProps) {
  const t = useTranslations("event");
  const locale = useLocale();

  const spotsLeft = event.capacity - event.numberOfParticipants;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3;

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const hasBanner = isValidBannerUrl(event.bannerUrl);

  return (
    <Link href={`/${locale}/event/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group mb-4">
        <div className="flex gap-4 p-4">
          {/* Banner Thumbnail */}
          <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-background">
            {hasBanner ? (
              <Image
                src={event.bannerUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconCalendar className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            {/* Price Badge */}
            <div className="absolute top-1.5 right-1.5">
              {event.fee === 0 ? (
                <Badge className="bg-green-500/90 text-white text-[10px] px-1.5 py-0 h-5 border-0 shadow-md">
                  {t("free")}
                </Badge>
              ) : (
                <Badge className="bg-blue-500/90 text-white text-[10px] px-1.5 py-0 h-5 border-0 shadow-md">
                  {formatCurrency(event.fee)}
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {event.title}
            </h4>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <IconCalendar className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="truncate font-medium">
                  {format(new Date(event.startAt), "MMM dd, HH:mm")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <IconClock className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="font-medium">
                  {event.expectedDurationInMinutes} {t("detail.minutes")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <IconUsers className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="font-medium">
                  {event.numberOfParticipants}/{event.capacity}
                </span>
                {isAlmostFull && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 border-0"
                  >
                    {t("almostFull")}
                  </Badge>
                )}
              </div>
            </div>

            {isFull && (
              <Badge
                variant="secondary"
                className="text-xs bg-muted text-muted-foreground"
              >
                {t("capacity")}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
