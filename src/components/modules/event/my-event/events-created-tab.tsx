"use client";

import { CreatedEventCard } from "@/components/modules/event/my-event/created-event-card";
import { EventStatDialog } from "@/components/modules/event/my-event/event-stat-dialog";
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
import { EventStatus } from "@/constants";
import {
  useCancelEventMutation,
  useGetHostedEvents,
} from "@/hooks/query/use-event";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconGridDots,
  IconLayoutList,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

export function EventsCreatedTab() {
  const t = useTranslations("event.myEvent.created");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const router = useRouter();

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "live"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch ALL hosted events with a large page size
  // We'll filter and paginate on the client side
  const {
    data: allEventsData,
    isLoading: isLoading,
    refetch: refetchEvents,
  } = useGetHostedEvents(
    {
      pageNumber: 1,
      pageSize: 100, // Fetch more to handle client-side pagination
      lang: locale,
    },
    { enabled: true }
  );

  const cancelEventMutation = useCancelEventMutation({
    onSuccess: (data) => {
      showSuccessToast(t("cancelDialog.success"), tSuccess);
      refetchEvents();
    },
    onError: (error) => {
      handleErrorApi({
        error,
        tError,
      });
    },
  });

  // Get all events
  const allEvents = allEventsData?.payload?.data?.items || [];

  // Filter and separate upcoming vs past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    let upcoming = allEvents.filter(
      (event) =>
        event.status === EventStatus.Pending ||
        event.status === EventStatus.Approved ||
        event.status === EventStatus.Live
    );

    let past = allEvents.filter(
      (event) =>
        event.status === EventStatus.Completed ||
        event.status === EventStatus.Cancelled ||
        event.status === EventStatus.Rejected
    );

    // Apply status filter to upcoming events
    if (statusFilter !== "all") {
      upcoming = upcoming.filter((event) => {
        if (statusFilter === "pending")
          return event.status === EventStatus.Pending;
        if (statusFilter === "approved")
          return event.status === EventStatus.Approved;
        if (statusFilter === "live") return event.status === EventStatus.Live;
        return true;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      upcoming = upcoming.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
      past = past.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [allEvents, statusFilter, searchQuery]);

  // Client-side pagination for upcoming events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / PAGE_SIZE);
  const upcomingPaginatedEvents = useMemo(() => {
    const startIndex = (upcomingPage - 1) * PAGE_SIZE;
    return upcomingEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [upcomingEvents, upcomingPage]);

  // Client-side pagination for past events
  const pastTotalPages = Math.ceil(pastEvents.length / PAGE_SIZE);
  const pastPaginatedEvents = useMemo(() => {
    const startIndex = (pastPage - 1) * PAGE_SIZE;
    return pastEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [pastEvents, pastPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setUpcomingPage(1);
    setPastPage(1);
  }, [searchQuery, statusFilter]);

  const handleEdit = (eventId: string) => {
    router.push(`/${locale}/event/edit/${eventId}`);
  };

  const handleCancel = (eventId: string, reason: string) => {
    cancelEventMutation.mutate({
      eventId,
      reason,
    });
  };

  const handleViewDetail = (eventId: string) => {
    router.push(`/${locale}/event/${eventId}`);
  };

  const handleViewStats = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowStatsDialog(true);
  };

  const handleCreateEvent = () => {
    router.push(`/${locale}/event/create`);
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: allEvents.length,
      upcoming: upcomingEvents.length,
      completed: allEvents.filter((e) => e.status === EventStatus.Completed)
        .length,
      totalParticipants: allEvents.reduce(
        (sum, e) => sum + e.numberOfParticipants,
        0
      ),
    };
  }, [allEvents, upcomingEvents]);

  return (
    <>
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconCalendarEvent className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("cardStats.totalEvents")}
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
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("cardStats.completed")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <IconUsers className="size-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalParticipants}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("cardStats.totalParticipants")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Controls */}
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
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("search.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("search.allStatus")}</SelectItem>
                  <SelectItem value="pending">{t("search.pending")}</SelectItem>
                  <SelectItem value="approved">
                    {t("search.approved")}
                  </SelectItem>
                  <SelectItem value="live">{t("search.live")}</SelectItem>
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
            <Button onClick={handleCreateEvent} size="sm">
              <IconPlus className="size-4 mr-2" />
              {t("createEvent")}
            </Button>
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
                  className={viewMode === "grid" ? "h-[280px]" : "h-[140px]"}
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
                  <CreatedEventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onViewDetail={handleViewDetail}
                    onViewStats={handleViewStats}
                    isCancelling={cancelEventMutation.isPending}
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
                    <EmptyDescription>{t("createFirst")}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={handleCreateEvent}>
                      <IconPlus className="size-4 mr-2" />
                      {t("createNewEvent")}
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Past Events Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{t("past")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {pastEvents.length}{" "}
                {pastEvents.length === 1
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
                  className={viewMode === "grid" ? "h-[280px]" : "h-[140px]"}
                />
              ))}
            </div>
          ) : pastPaginatedEvents.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                }
              >
                {pastPaginatedEvents.map((event) => (
                  <CreatedEventCard
                    key={event.id}
                    event={event}
                    onViewDetail={handleViewDetail}
                    onViewStats={handleViewStats}
                  />
                ))}
              </div>
              {pastTotalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pastPage}
                    totalPages={pastTotalPages}
                    totalItems={pastEvents.length}
                    pageSize={PAGE_SIZE}
                    hasNextPage={pastPage < pastTotalPages}
                    hasPreviousPage={pastPage > 1}
                    onPageChange={setPastPage}
                  />
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{t("noPast")}</EmptyTitle>
                    <EmptyDescription>
                      {t("pastEventsDescription")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Event Stats Dialog - uses useGetEventStats */}
      <EventStatDialog
        eventId={selectedEventId}
        open={showStatsDialog}
        onOpenChange={setShowStatsDialog}
      />
    </>
  );
}
