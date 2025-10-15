"use client";

import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components";
import {
  EmptyMatchingState,
  MatchingFilters,
  MatchingFilterSidebar,
  UserCard,
} from "@/components/modules/matching";
import { useGetUsersMatching } from "@/hooks";
import { useInterestsQuery, useLanguagesQuery } from "@/hooks/query";
import { handleErrorApi } from "@/lib/utils";

type SortOption = "recommended" | "newest" | "highestRating" | "onlineFirst";

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

  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUsersMatching(
    {
      pageNumber: 1,
      pageSize: 100,
      lang: locale,
    },
    { enabled: true }
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

  const allUsers = useMemo(
    () => usersData?.payload.data?.items || [],
    [usersData]
  );

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    // Search by name
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((user) =>
        user.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter online only (mock)
    if (filters.onlineOnly) {
      // Mock: filter random users
      result = result.filter(() => Math.random() > 0.3);
    }

    // Filter by speaking languages
    if (filters.speakingLanguageIds.length > 0) {
      result = result.filter((user) => {
        const userLanguageIds = (user.speakingLanguages || []).map((l) => l.id);
        return filters.speakingLanguageIds.some((id) =>
          userLanguageIds.includes(id)
        );
      });
    }

    // Filter by learning languages
    if (filters.learningLanguageIds.length > 0) {
      result = result.filter((user) => {
        const userLanguageIds = (user.learningLanguages || []).map((l) => l.id);
        return filters.learningLanguageIds.some((id) =>
          userLanguageIds.includes(id)
        );
      });
    }

    // Filter by interests
    if (filters.interestIds.length > 0) {
      result = result.filter((user) => {
        const userInterestIds = (user.interests || []).map((i) => i.id);
        return filters.interestIds.some((id) => userInterestIds.includes(id));
      });
    }

    return result;
  }, [allUsers, filters]);

  // Sorting
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
  };

  const hasActiveFilters =
    !!filters.search ||
    filters.onlineOnly ||
    filters.speakingLanguageIds.length > 0 ||
    filters.learningLanguageIds.length > 0 ||
    filters.interestIds.length > 0;

  const isLoading = isLoadingUsers || isLoadingLanguages || isLoadingInterests;

  // Handle error
  if (usersError) {
    handleErrorApi({ error: usersError, tError });
  }

  return (
    <div className="container mx-auto py-6">
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
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
            disabled={isLoading}
          />
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
              onFiltersChange={setFilters}
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
                onFiltersChange={setFilters}
                languages={languages}
                interests={interests}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="flex-1">
          {/* Loading State */}
          {isLoading && (
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
          {!isLoading && sortedUsers.length > 0 && (
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
          )}

          {/* Empty State */}
          {!isLoading && sortedUsers.length === 0 && (
            <EmptyMatchingState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}
