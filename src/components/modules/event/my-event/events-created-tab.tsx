"use client";

import { IconPlus } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CreatedEventCard } from "@/components/modules/event/my-event/created-event-card";
import { Pagination } from "@/components/shared";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Separator,
  Skeleton,
} from "@/components/ui";
import { EventStatus } from "@/constants";
import {
  useCancelEventMutation,
  useGetHostedEvents,
} from "@/hooks/query/use-event";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";

const PAGE_SIZE = 6;

export function EventsCreatedTab() {
  const t = useTranslations("event.myEvent.created");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const router = useRouter();

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  // Fetch upcoming events (Pending, Approved)
  const {
    data: upcomingData,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
  } = useGetHostedEvents(
    {
      pageNumber: upcomingPage,
      pageSize: PAGE_SIZE,
      lang: locale,
    },
    { enabled: true }
  );

  // Fetch past events (Completed, Cancelled, Rejected)
  const {
    data: pastData,
    isLoading: pastLoading,
    refetch: refetchPast,
  } = useGetHostedEvents(
    {
      pageNumber: pastPage,
      pageSize: PAGE_SIZE,
      lang: locale,
    },
    { enabled: true }
  );

  const cancelEventMutation = useCancelEventMutation({
    onSuccess: (data) => {
      showSuccessToast(t("cancelDialog.success"), tSuccess);
      refetchUpcoming();
      refetchPast();
    },
    onError: (error) => {
      handleErrorApi({
        error,
        tError,
      });
    },
  });

  // Filter upcoming events (Pending, Approved, Live)
  const upcomingEvents =
    upcomingData?.payload?.data?.items?.filter(
      (event) =>
        event.status === EventStatus.Pending ||
        event.status === EventStatus.Approved ||
        event.status === EventStatus.Live
    ) || [];

  // Filter past events (Completed, Cancelled, Rejected)
  const pastEvents =
    pastData?.payload?.data?.items?.filter(
      (event) =>
        event.status === EventStatus.Completed ||
        event.status === EventStatus.Cancelled ||
        event.status === EventStatus.Rejected
    ) || [];

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

  const handleCreateEvent = () => {
    router.push(`/${locale}/event/create`);
  };

  const upcomingMeta = upcomingData?.payload?.data;
  const pastMeta = pastData?.payload?.data;

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
                <CreatedEventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onViewDetail={handleViewDetail}
                  isCancelling={cancelEventMutation.isPending}
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
              <EmptyDescription>{t("createFirst")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateEvent}>
                <IconPlus className="size-4 mr-2" />
                {t("createFirst")}
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>

      <Separator />

      {/* Past Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{t("past")}</h2>
        </div>

        {pastLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        ) : pastEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <CreatedEventCard
                  key={event.id}
                  event={event}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
            {pastMeta && pastMeta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pastMeta.currentPage}
                  totalPages={pastMeta.totalPages}
                  totalItems={pastMeta.totalItems}
                  pageSize={pastMeta.pageSize}
                  hasNextPage={pastMeta.hasNextPage}
                  hasPreviousPage={pastMeta.hasPreviousPage}
                  onPageChange={setPastPage}
                />
              </div>
            )}
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("noPast")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
