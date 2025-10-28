"use client";

import {
  Button,
  EventCard,
  EventFilters,
  Input,
  Separator,
} from "@/components";
import { useGetRecommendedEvents, useGetUpcomingEvents } from "@/hooks";
import type { SearchEventsQueryType } from "@/models";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function EventListPage() {
  const t = useTranslations("event");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchEventsQueryType>({
    pageNumber: 1,
    pageSize: 12,
    lang: locale,
  });

  const {
    data: upcomingData,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useGetUpcomingEvents({
    ...filters,
    name: searchQuery || undefined,
  });

  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useGetRecommendedEvents({
      pageNumber: 1,
      pageSize: 6,
      lang: locale,
    });

  const upcomingEvents = upcomingData?.payload?.data?.items || [];
  const recommendedEvents = recommendedData?.payload?.data?.items || [];

  const handleFilterChange = (newFilters: Partial<SearchEventsQueryType>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      pageNumber: 1, // Reset to pageNumber 1 when filters change
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            Discover and join amazing events
          </p>
        </div>
        <Link href={`/${locale}/event/create`}>
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            {t("createEvent")}
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <EventFilters
          currentFilters={{
            // EventFilters expects arrays for languageIds/interestIds
            languageIds: Array.isArray(filters.languageIds)
              ? filters.languageIds
              : filters.languageIds
                ? [filters.languageIds]
                : undefined,
            interestIds: Array.isArray(filters.interestIds)
              ? filters.interestIds
              : filters.interestIds
                ? [filters.interestIds]
                : undefined,
            fee: filters.fee,
          }}
          onFilterChange={(newFilters) =>
            // map back to SearchEventsQueryType shape when updating
            handleFilterChange({
              ...newFilters,
              languageIds:
                newFilters.languageIds && newFilters.languageIds.length > 0
                  ? newFilters.languageIds
                  : undefined,
              interestIds:
                newFilters.interestIds && newFilters.interestIds.length > 0
                  ? newFilters.interestIds
                  : undefined,
            })
          }
        />
      </div>

      {/* Recommended Events Section */}
      {recommendedEvents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{t("recommendedEvents")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Separator className="my-8" />
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("upcomingEvents")}</h2>

        {isLoadingUpcoming ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : upcomingError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load events. Please try again.
            </p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {upcomingData?.payload?.data?.totalPages &&
        upcomingData.payload.data.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.pageNumber === 1}
              onClick={() =>
                handleFilterChange({
                  pageNumber: (filters.pageNumber || 1) - 1,
                })
              }
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {filters.pageNumber} of{" "}
                {upcomingData.payload.data.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={
                filters.pageNumber === upcomingData.payload.data.totalPages
              }
              onClick={() =>
                handleFilterChange({
                  pageNumber: (filters.pageNumber || 1) + 1,
                })
              }
            >
              Next
            </Button>
          </div>
        )}
    </div>
  );
}
