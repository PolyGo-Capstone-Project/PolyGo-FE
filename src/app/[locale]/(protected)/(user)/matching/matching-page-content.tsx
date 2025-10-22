"use client";

import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  EmptyMatchingState,
  Input,
  MatchingFilterSidebar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  UserCard,
} from "@/components";
import {
  useGetUsersMatching,
  useInterestsQuery,
  useLanguagesQuery,
  useSearchUsers,
} from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import { UserMatchingItemType } from "@/models";

type SortOption = "recommended" | "newest" | "highestRating" | "onlineFirst";

export type MatchingFilters = {
  search: string;
  onlineOnly: boolean;
  speakingLanguageIds: string[];
  learningLanguageIds: string[];
  interestIds: string[];
};

const PAGE_SIZE = 12;
const DEBOUNCE_DELAY = 1000; // 1000ms debounce

export default function MatchingPageContent() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("matching");
  const tSorting = useTranslations("matching.sorting");
  const tError = useTranslations("Error");

  // Filters state
  const [filters, setFilters] = useState<MatchingFilters>({
    search: "",
    onlineOnly: false,
    speakingLanguageIds: [],
    learningLanguageIds: [],
    interestIds: [],
  });

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Accumulated users from all loaded pages
  const [accumulatedUsers, setAccumulatedUsers] = useState<
    UserMatchingItemType[]
  >([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Check if any filter is active (excluding onlineOnly for now since it's not implemented in API)
  const hasActiveFilters =
    !!debouncedSearch.trim() ||
    filters.speakingLanguageIds.length > 0 ||
    filters.learningLanguageIds.length > 0 ||
    filters.interestIds.length > 0;

  // Prepare search query params
  const searchParams = useMemo(() => {
    if (!hasActiveFilters) return null;

    return {
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      lang: locale,
      ...(debouncedSearch.trim() && { name: debouncedSearch.trim() }),
      ...(filters.speakingLanguageIds.length > 0 && {
        speakingLanguageIds: filters.speakingLanguageIds,
      }),
      ...(filters.learningLanguageIds.length > 0 && {
        learningLanguageIds: filters.learningLanguageIds,
      }),
      ...(filters.interestIds.length > 0 && {
        interestIds: filters.interestIds,
      }),
    };
  }, [filters, debouncedSearch, currentPage, locale, hasActiveFilters]);

  // Fetch matching users (when no filters)
  const {
    data: matchingData,
    isLoading: isLoadingMatching,
    error: matchingError,
  } = useGetUsersMatching(
    {
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      lang: locale,
    },
    { enabled: !hasActiveFilters }
  );

  // Fetch search results (when filters applied)
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useSearchUsers(searchParams!, { enabled: hasActiveFilters });

  // Fetch languages for filters
  const { data: languagesData, isLoading: isLoadingLanguages } =
    useLanguagesQuery({
      params: { lang: locale, pageNumber: 1, pageSize: 100 },
    });

  // Fetch interests for filters
  const { data: interestsData, isLoading: isLoadingInterests } =
    useInterestsQuery({
      params: { lang: locale, pageNumber: 1, pageSize: 100 },
    });

  // Transform data
  const languages = useMemo(
    () => languagesData?.payload.data?.items || [],
    [languagesData]
  );

  const interests = useMemo(
    () => interestsData?.payload.data?.items || [],
    [interestsData]
  );

  // Get current data source
  const currentData = hasActiveFilters ? searchData : matchingData;
  const currentError = hasActiveFilters ? searchError : matchingError;
  const isLoadingUsers = hasActiveFilters ? isLoadingSearch : isLoadingMatching;

  const newUsers = useMemo(
    () => currentData?.payload.data?.items || [],
    [currentData]
  );

  const totalItems = useMemo(
    () => currentData?.payload.data?.totalItems || 0,
    [currentData]
  );

  const totalPages = useMemo(
    () => currentData?.payload.data?.totalPages || 0,
    [currentData]
  );

  const hasMore = currentPage < totalPages;

  // Accumulate users when new data arrives
  useEffect(() => {
    if (newUsers.length > 0) {
      if (currentPage === 1) {
        // Reset accumulated users on first page
        setAccumulatedUsers(newUsers);
      } else {
        // Append new users, avoiding duplicates
        setAccumulatedUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
          const uniqueNewUsers = newUsers.filter((u) => !existingIds.has(u.id));
          return [...prev, ...uniqueNewUsers];
        });
      }
    } else if (currentPage === 1 && !isLoadingUsers) {
      // Clear accumulated users if first page returns empty
      setAccumulatedUsers([]);
    }
  }, [newUsers, currentPage, isLoadingUsers]);

  // Reset page when debounced search or other filters change
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedUsers([]);
  }, [
    debouncedSearch,
    filters.speakingLanguageIds,
    filters.learningLanguageIds,
    filters.interestIds,
  ]);

  // Client-side filtering for onlineOnly (since API doesn't support it yet)
  const filteredUsers = useMemo(() => {
    let result = [...accumulatedUsers];

    // Filter online only (mock - will be removed when API supports it)
    if (filters.onlineOnly) {
      result = result.filter(() => Math.random() > 0.3);
    }

    return result;
  }, [accumulatedUsers, filters.onlineOnly]);

  // Sorting (mock - will be removed when API supports it)
  const sortedUsers = useMemo(() => {
    const users = [...filteredUsers];

    switch (sortBy) {
      case "newest":
        return users.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
      case "highestRating":
        // Sort by meritLevel priority
        const meritPriority: Record<string, number> = {
          Admin: 5,
          Reliable: 4,
          Monitored: 3,
          Restricted: 2,
          Banned: 1,
        };
        return users.sort(
          (a, b) =>
            (meritPriority[b.meritLevel] || 0) -
            (meritPriority[a.meritLevel] || 0)
        );
      case "onlineFirst":
        // Mock: random online first
        return users.sort(() => Math.random() - 0.5);
      case "recommended":
      default:
        return users;
    }
  }, [filteredUsers, sortBy]);

  // Handle navigation
  const handleViewProfile = (userId: string) => {
    router.push(`/${locale}/matching/${userId}`);
  };

  const handleAddFriend = (userId: string) => {
    console.log("Add friend:", userId);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      onlineOnly: false,
      speakingLanguageIds: [],
      learningLanguageIds: [],
      interestIds: [],
    });
    setDebouncedSearch("");
    setCurrentPage(1);
    setAccumulatedUsers([]);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingUsers) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Update filters (for non-search filters)
  const handleFiltersChange = (newFilters: MatchingFilters) => {
    setFilters(newFilters);
  };

  // Update search separately to allow immediate UI update
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const isLoading = isLoadingUsers || isLoadingLanguages || isLoadingInterests;

  // Show searching indicator when debouncing
  const isSearching =
    filters.search !== debouncedSearch && filters.search.length > 0;

  // Handle error
  if (currentError) {
    handleErrorApi({ error: currentError, tError });
  }

  return (
    <div className="container mx-auto py-6 p-4">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <IconSparkles className="h-8 w-8 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Top Bar - Search & Sort */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {t("loading")}...
            </span>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Toggle */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <IconSparkles className="mr-2 h-4 w-4" />
            {t("filters.title")}
          </Button>

          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">
                {tSorting("recommended")}
              </SelectItem>
              <SelectItem value="newest">{tSorting("newest")}</SelectItem>
              <SelectItem value="highestRating">
                {tSorting("highestRating")}
              </SelectItem>
              <SelectItem value="onlineFirst">
                {tSorting("onlineFirst")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-6">
            <MatchingFilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              languages={languages}
              interests={interests}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-[280px] overflow-y-auto border-r bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MatchingFilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                languages={languages}
                interests={interests}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="flex-1">
          {/* Loading State - First Load */}
          {isLoadingUsers && currentPage === 1 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4 rounded-xl border p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users List */}
          {!isLoadingUsers && sortedUsers.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {sortedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onViewProfile={handleViewProfile}
                    onAddFriend={handleAddFriend}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoadingUsers}
                  >
                    {isLoadingUsers ? t("loading") : t("loadMore")}
                  </Button>
                </div>
              )}

              {/* Results Info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {t("showingResults", {
                  current: sortedUsers.length,
                  total: totalItems,
                })}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoadingUsers && sortedUsers.length === 0 && (
            <EmptyMatchingState
              hasFilters={hasActiveFilters || filters.onlineOnly}
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Loading More State */}
          {isLoadingUsers && currentPage > 1 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4 rounded-xl border p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
