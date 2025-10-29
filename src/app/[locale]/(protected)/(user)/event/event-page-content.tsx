"use client";

import { Button, Input } from "@/components";
import {
  EventCard,
  EventCardCompact,
  EventFilters,
} from "@/components/modules/event";
import { useGetRecommendedEvents, useGetUpcomingEvents } from "@/hooks";
import type { SearchEventsQueryType } from "@/models";
import { IconPlus, IconSearch, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const UPCOMING_PAGE_SIZE = 6;
const RECOMMENDED_PAGE_SIZE = 4;

type TimeFilterType = "today" | "thisWeek" | "thisMonth";

// Helper to convert time filter to datetime
function getTimeRangeFromFilter(filter?: TimeFilterType): Date | undefined {
  if (!filter) return undefined;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return today;
    case "thisWeek":
      // Start of current week (Monday)
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      return new Date(today.getTime() + diff * 24 * 60 * 60 * 1000);
    case "thisMonth":
      // Start of current month
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return undefined;
  }
}

export default function EventListPage() {
  const t = useTranslations("event");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<
    Omit<SearchEventsQueryType, "pageNumber" | "pageSize" | "lang"> & {
      time?: TimeFilterType;
    }
  >({});

  // State for load more
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedEvents, setLoadedEvents] = useState<any[]>([]);
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setLoadedEvents([]);
    setIsLoadMorePending(false);
  }, [
    debouncedSearch,
    filters.languageIds,
    filters.interestIds,
    filters.isFree,
    filters.time,
  ]);

  // Query params with proper time conversion
  const upcomingQueryParams = useMemo(() => {
    const timeDate = getTimeRangeFromFilter(filters.time);

    return {
      pageNumber: currentPage,
      pageSize: UPCOMING_PAGE_SIZE,
      lang: locale,
      name: debouncedSearch || undefined,
      languageIds: filters.languageIds,
      interestIds: filters.interestIds,
      isFree: filters.isFree,
      time: timeDate ? timeDate.toISOString() : undefined,
    };
  }, [
    currentPage,
    locale,
    debouncedSearch,
    filters.languageIds,
    filters.interestIds,
    filters.isFree,
    filters.time,
  ]);

  const {
    data: upcomingData,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useGetUpcomingEvents(upcomingQueryParams);

  const {
    data: recommendedData,
    isLoading: isLoadingRecommended,
    error: recommendedError,
  } = useGetRecommendedEvents({
    pageNumber: 1,
    pageSize: RECOMMENDED_PAGE_SIZE,
    lang: locale,
  });

  const recommendedEvents = recommendedData?.payload?.data?.items || [];

  // Update loaded events when data changes
  useEffect(() => {
    if (!upcomingData?.payload?.data?.items) return;

    const newItems = upcomingData.payload.data.items;

    setLoadedEvents((prev) => {
      if (currentPage === 1) {
        return newItems;
      }

      const existingIds = new Set(prev.map((event) => event.id));
      const uniqueNewItems = newItems.filter(
        (event) => !existingIds.has(event.id)
      );
      return [...prev, ...uniqueNewItems];
    });

    if (isLoadMorePending) {
      setIsLoadMorePending(false);
    }
  }, [upcomingData, currentPage, isLoadMorePending]);

  const hasMore = useMemo(() => {
    if (isLoadingUpcoming) return true;
    if (!upcomingData?.payload?.data) return false;

    const { hasNextPage, totalItems } = upcomingData.payload.data;
    return hasNextPage && loadedEvents.length < totalItems;
  }, [isLoadingUpcoming, upcomingData, loadedEvents.length]);

  const handleFilterChange = (
    newFilters: Partial<
      Omit<SearchEventsQueryType, "pageNumber" | "pageSize" | "lang"> & {
        time?: TimeFilterType;
      }
    >
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingUpcoming || isLoadMorePending) return;

    setIsLoadMorePending(true);
    setCurrentPage((prev) => prev + 1);
  };

  const isSearching = searchQuery !== debouncedSearch && searchQuery.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("discoverAndJoin")}</p>
        </div>
        <Link href={`/${locale}/event/create`}>
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            {t("createEvent")}
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchUpcoming")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {t("searching")}...
          </span>
        )}
      </div>

      {/* Inline Filters */}
      <div className="mb-8">
        <EventFilters
          currentFilters={{
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
            isFree: filters.isFree,
            time: filters.time,
          }}
          onFilterChange={(newFilters) =>
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

      {/* Two Column Layout */}
      <div className="flex gap-8">
        {/* Left Column - Upcoming Events (70%) */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            {t("upcomingEvents")}
          </h2>

          {/* Loading State - First Load */}
          {isLoadingUpcoming && currentPage === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {upcomingError && !isLoadingUpcoming && (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">{t("loadError")}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCurrentPage(1)}
              >
                {t("retry")}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingUpcoming &&
            !upcomingError &&
            loadedEvents.length === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">{t("noResults")}</p>
              </div>
            )}

          {/* Events Grid */}
          {!isLoadingUpcoming && loadedEvents.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {loadedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Loading More State */}
              {(isLoadingUpcoming || isLoadMorePending) && currentPage > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-96 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoadingUpcoming || isLoadMorePending}
                  >
                    {isLoadingUpcoming || isLoadMorePending
                      ? t("loading")
                      : t("loadMore")}
                  </Button>
                </div>
              )}

              {/* Results Info */}
              {!hasMore && loadedEvents.length > 0 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {t("allLoaded")}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Recommended Events (30%) */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-primary" />
              {t("recommendedEvents")}
            </h2>

            {/* Loading State */}
            {isLoadingRecommended && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {recommendedError && !isLoadingRecommended && (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("recommendedError")}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingRecommended &&
              !recommendedError &&
              recommendedEvents.length === 0 && (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("noRecommended")}
                  </p>
                </div>
              )}

            {/* Recommended Events List */}
            {!isLoadingRecommended && recommendedEvents.length > 0 && (
              <div className="space-y-3">
                {recommendedEvents.map((event) => (
                  <EventCardCompact key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Recommended Section */}
      {recommendedEvents.length > 0 && (
        <div className="lg:hidden mt-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            {t("recommendedEvents")}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {recommendedEvents.map((event) => (
              <div key={event.id} className="w-72 flex-shrink-0 snap-start">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
