"use client";

import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconGridDots,
  IconLayoutList,
  IconSearch,
  IconTicket,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { JoinedEventCard } from "@/components/modules/event/my-event/joined-event-card";
import { Pagination } from "@/components/shared";
import {
  Button,
  Card,
  CardContent,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from "@/components/ui";
import {
  useGetParticipatedEvents,
  useUnregisterEventMutation,
} from "@/hooks/query/use-event";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";

const PAGE_SIZE = 8;

export function EventsJoinedTab() {
  const t = useTranslations("event.myEvent.joined");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const router = useRouter();

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch ALL participated events with a large page size
  // We'll filter and paginate on the client side
  const {
    data: allEventsData,
    isLoading: isLoading,
    refetch: refetchEvents,
  } = useGetParticipatedEvents(
    {
      pageNumber: 1,
      pageSize: 100, // Fetch more to handle client-side pagination
      lang: locale,
    },
    { enabled: true }
  );

  const unregisterMutation = useUnregisterEventMutation({
    onSuccess: (data) => {
      showSuccessToast(data?.payload.message, tSuccess);
      refetchEvents();
    },
    onError: (error) => {
      handleErrorApi({ error, tError });
    },
  });

  // Memoize current time to avoid recreating Date object on every render
  const now = useMemo(() => new Date(), []);

  const allEvents = useMemo(
    () => allEventsData?.payload.data.items || [],
    [allEventsData?.payload.data.items]
  );

  // Filter and separate upcoming vs history events
  const { upcomingEvents, historyEvents } = useMemo(() => {
    let upcoming = allEvents.filter((event) => new Date(event.startAt) > now);
    let history = allEvents.filter((event) => new Date(event.startAt) <= now);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      upcoming = upcoming.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
      history = history.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting to upcoming (earliest first)
    if (sortBy === "date") {
      upcoming.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
    } else if (sortBy === "name") {
      upcoming.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Apply sorting to history (latest first)
    if (sortBy === "date") {
      history.sort(
        (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      );
    } else if (sortBy === "name") {
      history.sort((a, b) => a.title.localeCompare(b.title));
    }

    return { upcomingEvents: upcoming, historyEvents: history };
  }, [allEvents, searchQuery, sortBy, now]);

  // Client-side pagination for upcoming events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / PAGE_SIZE);
  const upcomingPaginatedEvents = useMemo(() => {
    const startIndex = (upcomingPage - 1) * PAGE_SIZE;
    return upcomingEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [upcomingEvents, upcomingPage]);

  // Client-side pagination for history events
  const historyTotalPages = Math.ceil(historyEvents.length / PAGE_SIZE);
  const historyPaginatedEvents = useMemo(() => {
    const startIndex = (historyPage - 1) * PAGE_SIZE;
    return historyEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [historyEvents, historyPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setUpcomingPage(1);
    setHistoryPage(1);
  }, [searchQuery, sortBy]);

  const handleViewDetail = (eventId: string) => {
    router.push(`/${locale}/event/${eventId}`);
  };

  const handleUnregister = (eventId: string, reason: string) => {
    unregisterMutation.mutate({ eventId, reason });
  };

  const handleExploreEvents = () => {
    router.push(`/${locale}/event`);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalFees = allEvents
      .filter((e) => new Date(e.startAt) <= now)
      .reduce((sum: number, e) => sum + e.fee, 0);

    return {
      total: allEvents.length,
      upcoming: upcomingEvents.length,
      attended: allEvents.filter((e) => new Date(e.startAt) <= now).length,
      totalFees,
    };
  }, [allEvents, upcomingEvents, now]);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconTicket className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cardStats.totalJoined")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <IconClock className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cardStats.upcomingEvents")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <IconCheck className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.attended}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cardStats.attended")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <IconCalendarEvent className="size-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalFees.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("cardStats.totalFeesPaid")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Sort Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t("search.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t("search.sortByDate")}</SelectItem>
                <SelectItem value="name">{t("search.sortByName")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <IconGridDots className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <IconLayoutList className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{t("upcoming")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingEvents.length}{" "}
              {upcomingEvents.length === 1
                ? t("eventCount.singular")
                : t("eventCount.plural")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
            }
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={viewMode === "grid" ? "h-[260px]" : "h-[130px]"}
              />
            ))}
          </div>
        ) : upcomingPaginatedEvents.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {upcomingPaginatedEvents.map((event) => (
                <JoinedEventCard
                  key={event.id}
                  event={event}
                  onViewDetail={handleViewDetail}
                  onUnregister={handleUnregister}
                  isUnregistering={unregisterMutation.isPending}
                />
              ))}
            </div>
            {upcomingTotalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={upcomingPage}
                  totalPages={upcomingTotalPages}
                  totalItems={upcomingEvents.length}
                  pageSize={PAGE_SIZE}
                  hasNextPage={upcomingPage < upcomingTotalPages}
                  hasPreviousPage={upcomingPage > 1}
                  onPageChange={setUpcomingPage}
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
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
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{t("history")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {historyEvents.length}{" "}
              {historyEvents.length === 1
                ? t("eventCount.singular")
                : t("eventCount.plural")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
            }
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={viewMode === "grid" ? "h-[260px]" : "h-[130px]"}
              />
            ))}
          </div>
        ) : historyPaginatedEvents.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {historyPaginatedEvents.map((event) => (
                <JoinedEventCard
                  key={event.id}
                  event={event}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
            {historyTotalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  totalItems={historyEvents.length}
                  pageSize={PAGE_SIZE}
                  hasNextPage={historyPage < historyTotalPages}
                  hasPreviousPage={historyPage > 1}
                  onPageChange={setHistoryPage}
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{t("noHistory")}</EmptyTitle>
                  <EmptyDescription>
                    {t("historyEventsDescription")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
