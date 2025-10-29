"use client";

import { IconSearch } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { JoinedEventCard } from "@/components/modules/event/my-event/joined-event-card";
import { Pagination } from "@/components/shared";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
  Separator,
  Skeleton,
} from "@/components/ui";
import { useGetParticipatedEvents } from "@/hooks/query/use-event";

const PAGE_SIZE = 6;

export function EventsJoinedTab() {
  const t = useTranslations("event.myEvent.joined");
  const locale = useLocale();
  const router = useRouter();

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch upcoming events - events that haven't started yet
  const { data: upcomingData, isLoading: upcomingLoading } =
    useGetParticipatedEvents(
      {
        pageNumber: upcomingPage,
        pageSize: PAGE_SIZE,
        lang: locale,
      },
      { enabled: true }
    );

  // Fetch history events - events that have completed or cancelled
  const { data: historyData, isLoading: historyLoading } =
    useGetParticipatedEvents(
      {
        pageNumber: historyPage,
        pageSize: PAGE_SIZE,
        lang: locale,
      },
      { enabled: true }
    );

  // Filter upcoming events (future events)
  const now = new Date();
  const upcomingEvents =
    upcomingData?.payload?.data?.items?.filter(
      (event) => new Date(event.startAt) > now
    ) || [];

  // Filter history events (past events)
  const historyEvents =
    historyData?.payload?.data?.items?.filter(
      (event) => new Date(event.startAt) <= now
    ) || [];

  const handleViewDetail = (eventId: string) => {
    router.push(`/${locale}/event/${eventId}`);
  };

  const handleExploreEvents = () => {
    router.push(`/${locale}/event`);
  };

  const upcomingMeta = upcomingData?.payload?.data;
  const historyMeta = historyData?.payload?.data;

  return (
    <div className="space-y-8">
      {/* Upcoming Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{t("upcoming")}</h2>
        </div>

        {upcomingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <JoinedEventCard
                  key={event.id}
                  event={event}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
            {upcomingMeta && upcomingMeta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={upcomingMeta.currentPage}
                  totalPages={upcomingMeta.totalPages}
                  totalItems={upcomingMeta.totalItems}
                  pageSize={upcomingMeta.pageSize}
                  hasNextPage={upcomingMeta.hasNextPage}
                  hasPreviousPage={upcomingMeta.hasPreviousPage}
                  onPageChange={setUpcomingPage}
                />
              </div>
            )}
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("noUpcoming")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleExploreEvents}>
                <IconSearch className="size-4 mr-2" />
                {t("exploreEvents")}
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>

      <Separator />

      {/* History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{t("history")}</h2>
        </div>

        {historyLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        ) : historyEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyEvents.map((event) => (
                <JoinedEventCard
                  key={event.id}
                  event={event}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
            {historyMeta && historyMeta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={historyMeta.currentPage}
                  totalPages={historyMeta.totalPages}
                  totalItems={historyMeta.totalItems}
                  pageSize={historyMeta.pageSize}
                  hasNextPage={historyMeta.hasNextPage}
                  hasPreviousPage={historyMeta.hasPreviousPage}
                  onPageChange={setHistoryPage}
                />
              </div>
            )}
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("noHistory")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
