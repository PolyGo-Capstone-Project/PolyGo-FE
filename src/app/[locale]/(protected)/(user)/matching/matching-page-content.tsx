"use client";

import {
  Badge,
  Button,
  EmptyMatchingState,
  FriendsDialog,
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
  useAcceptFriendRequestMutation,
  useGetFriendRequests,
  useGetUsersMatching,
  useInterestsQuery,
  useLanguagesQuery,
  useRejectFriendRequestMutation,
  useSearchUsers,
  useSendFriendRequestMutation,
} from "@/hooks";
import { handleErrorApi, showErrorToast, showSuccessToast } from "@/lib/utils";
import type { SearchUserQueryType, UserMatchingItemType } from "@/models";
import { IconSearch, IconSparkles, IconUsers } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const tSuccess = useTranslations("Success");
  // Friends dialog state
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);

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
  const [loadedUsers, setLoadedUsers] = useState<UserMatchingItemType[]>([]);
  const [paginationMeta, setPaginationMeta] = useState({
    totalItems: 0,
    hasNextPage: false,
  });
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);
  const [isRefetchingAfterMutation, setIsRefetchingAfterMutation] =
    useState(false);

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
    refetch: refetchMatching,
  } = useGetUsersMatching(
    {
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
      lang: locale,
    },
    { enabled: !hasActiveFilters }
  );

  // Fetch search results (when filters applied)
  const fallbackSearchQuery = useMemo(
    () =>
      ({
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        lang: locale,
      }) as SearchUserQueryType,
    [locale]
  );

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchUsers(
    (searchParams ?? fallbackSearchQuery) as SearchUserQueryType,
    {
      enabled: hasActiveFilters,
    }
  );

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

  // Fetch friend requests for notification badge
  const { data: friendRequestsData, refetch: refetchFriendRequests } =
    useGetFriendRequests(
      { pageNumber: 1, pageSize: 100, lang: locale },
      { enabled: true }
    );

  const friendRequestsCount = useMemo(
    () => friendRequestsData?.payload.data?.items?.length || 0,
    [friendRequestsData]
  );

  // Friend mutations
  const sendFriendRequestMutation = useSendFriendRequestMutation({
    onSuccess: async () => {
      showSuccessToast("friendRequestSent", tSuccess);
      // Refetch to update friend status
      setIsRefetchingAfterMutation(true);
      setCurrentPage(1);
      setLoadedUsers([]);
      if (hasActiveFilters) {
        await refetchSearch();
      } else {
        await refetchMatching();
      }
      setIsRefetchingAfterMutation(false);
    },
    onError: () => {
      showErrorToast("friendRequestFailed", tError);
    },
  });

  const acceptFriendRequestMutation = useAcceptFriendRequestMutation({
    onSuccess: async () => {
      showSuccessToast("friendRequestAccepted", tSuccess);
      refetchFriendRequests();
      // Refetch to update friend status
      setIsRefetchingAfterMutation(true);
      setCurrentPage(1);
      setLoadedUsers([]);
      if (hasActiveFilters) {
        await refetchSearch();
      } else {
        await refetchMatching();
      }
      setIsRefetchingAfterMutation(false);
    },
    onError: () => {
      showErrorToast("failAccept", tError);
    },
  });

  const rejectFriendRequestMutation = useRejectFriendRequestMutation({
    onSuccess: async () => {
      showSuccessToast("friendRequestRejected", tSuccess);
      refetchFriendRequests();
      // Refetch to update friend status
      setIsRefetchingAfterMutation(true);
      setCurrentPage(1);
      setLoadedUsers([]);
      if (hasActiveFilters) {
        await refetchSearch();
      } else {
        await refetchMatching();
      }
      setIsRefetchingAfterMutation(false);
    },
    onError: () => {
      showErrorToast("failReject", tError);
    },
  });

  // Get current data source
  const currentData = hasActiveFilters ? searchData : matchingData;
  const currentError = hasActiveFilters ? searchError : matchingError;
  const isLoadingUsers = hasActiveFilters ? isLoadingSearch : isLoadingMatching;

  // Maintain accumulated list so "Load more" appends instead of replacing
  const displayUsers = useMemo(() => {
    let result = [...loadedUsers];

    // Client-side filtering for onlineOnly (since API doesn't support it yet)
    if (filters.onlineOnly) {
      result = result.filter(() => Math.random() > 0.3);
    }

    return result;
  }, [loadedUsers, filters.onlineOnly]);

  // Reset page when debounced search or other filters change
  useEffect(() => {
    setCurrentPage(1);
    setLoadedUsers([]);
    setPaginationMeta({ totalItems: 0, hasNextPage: false });
    setIsLoadMorePending(false);
  }, [
    debouncedSearch,
    filters.speakingLanguageIds,
    filters.learningLanguageIds,
    filters.interestIds,
    locale,
    hasActiveFilters,
  ]);

  useEffect(() => {
    const items = (currentData?.payload.data?.items ??
      []) as UserMatchingItemType[];
    if (!currentData) return;

    setLoadedUsers((prev) => {
      if (currentPage === 1) {
        return items;
      }

      const existingIds = new Set(prev.map((user) => user.id));
      const newItems = items.filter((user) => !existingIds.has(user.id));
      return [...prev, ...newItems];
    });

    if (isLoadMorePending) {
      setIsLoadMorePending(false);
    }
  }, [currentData, currentPage, isLoadMorePending]);

  useEffect(() => {
    const payload = currentData?.payload.data;
    if (!payload) return;

    setPaginationMeta({
      totalItems: payload.totalItems ?? 0,
      hasNextPage: payload.hasNextPage ?? false,
    });
  }, [currentData]);

  useEffect(() => {
    if (!currentError) {
      return;
    }

    if (isLoadMorePending) {
      setIsLoadMorePending(false);
    }

    if (currentPage === 1) return;

    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, [currentError, currentPage, isLoadMorePending]);

  const hasMore = useMemo(() => {
    if (isLoadingUsers) {
      return true;
    }

    if (!paginationMeta.hasNextPage) {
      return false;
    }

    const total = paginationMeta.totalItems;
    return total === 0 || loadedUsers.length < total;
  }, [
    isLoadingUsers,
    paginationMeta.hasNextPage,
    paginationMeta.totalItems,
    loadedUsers.length,
  ]);

  // Sorting (mock - will be removed when API supports it)
  const sortedUsers = useMemo(() => {
    const users = [...displayUsers];

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
  }, [displayUsers, sortBy]);

  // Handle navigation
  const handleViewProfile = (userId: string) => {
    router.push(`/${locale}/matching/${userId}`);
  };

  const handleAddFriend = (userId: string) => {
    sendFriendRequestMutation.mutate({ receiverId: userId });
  };

  const handleAcceptFriend = (userId: string) => {
    acceptFriendRequestMutation.mutate({ senderId: userId });
  };

  const handleRejectFriend = (userId: string) => {
    rejectFriendRequestMutation.mutate({ senderId: userId });
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
    setIsLoadMorePending(false);
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingUsers || isLoadMorePending) {
      return;
    }

    setIsLoadMorePending(true);
    setCurrentPage((prev) => prev + 1);
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
      <div className="flex justify-between mb-6 space-y-2">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <IconSparkles className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {/* Friends Button with Badge */}
        <Button
          variant="outline"
          onClick={() => setFriendsDialogOpen(true)}
          className="relative"
        >
          <IconUsers className="mr-2 h-4 w-4" />
          {t("friends.title")}
          {friendRequestsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-5 px-1.5"
            >
              {friendRequestsCount}
            </Badge>
          )}
        </Button>
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
              {t("loading.default")}...
            </span>
          )}
        </div>

        {/* Sort & Friends Button */}
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
                    onAcceptFriend={handleAcceptFriend}
                    onRejectFriend={handleRejectFriend}
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
                    disabled={isLoadingUsers || isLoadMorePending}
                  >
                    {isLoadingUsers || isLoadMorePending
                      ? t("loading")
                      : t("loadMore")}
                  </Button>
                </div>
              )}

              {/* Results Info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {t("showingResults", {
                  current: sortedUsers.length,
                  total: paginationMeta.totalItems,
                })}
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoadingUsers &&
            !isRefetchingAfterMutation &&
            sortedUsers.length === 0 && (
              <EmptyMatchingState
                hasFilters={hasActiveFilters || filters.onlineOnly}
                onClearFilters={handleClearFilters}
              />
            )}

          {/* Refetching State */}
          {isRefetchingAfterMutation && sortedUsers.length === 0 && (
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

          {/* Loading More State */}
          {(isLoadingUsers || isLoadMorePending) && currentPage > 1 && (
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

      {/* Friends Dialog */}
      <FriendsDialog
        open={friendsDialogOpen}
        onOpenChange={setFriendsDialogOpen}
        locale={locale}
        onDataChange={async () => {
          // Refetch to update friend status after dialog interactions
          setIsRefetchingAfterMutation(true);
          setCurrentPage(1);
          setLoadedUsers([]);
          if (hasActiveFilters) {
            await refetchSearch();
          } else {
            await refetchMatching();
          }
          setIsRefetchingAfterMutation(false);
        }}
      />
    </div>
  );
}
