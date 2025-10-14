"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components";
import {
  EmptyMatchingState,
  MatchingFilters,
  MatchingFiltersBar,
  UserCard,
} from "@/components/modules/matching";
import { useGetUsersMatching } from "@/hooks";
import {
  useInterestsQuery,
  useLanguagesQuery,
  useUserInterestsQuery,
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks/query";
import { handleErrorApi } from "@/lib/utils";

export default function MatchingPageContent() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("matching");
  const tError = useTranslations("Error");

  // Filters state
  const [filters, setFilters] = useState<MatchingFilters>({
    search: "",
    languageIds: [],
    interestIds: [],
  });

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUsersMatching(
    {
      pageNumber: 1,
      pageSize: 100, // Get all users for client-side filtering
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

  // Fetch user's languages and interests for matching (optional enhancement)
  const { data: userSpeakingLanguages } = useUserLanguagesSpeakingQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 100 },
  });

  const { data: userLearningLanguages } = useUserLanguagesLearningQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 100 },
  });

  const { data: userInterests } = useUserInterestsQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 100 },
  });

  // Transform data for display
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

    // Filter by languages - Mock for now since we don't have user language data in list
    // In real scenario, backend should return this data or we need separate API calls
    if (filters.languageIds.length > 0) {
      // TODO: This needs backend support to filter properly
      // For now, we'll keep all users as placeholder
    }

    // Filter by interests - Mock for now
    if (filters.interestIds.length > 0) {
      // TODO: This needs backend support to filter properly
      // For now, we'll keep all users as placeholder
    }

    return result;
  }, [allUsers, filters]);

  // Handle navigation to profile
  const handleViewProfile = (userId: string) => {
    router.push(`/${locale}/matching/${userId}`);
  };

  // Handle add friend (not implemented yet)
  const handleAddFriend = (userId: string) => {
    // TODO: Implement add friend functionality
    console.log("Add friend:", userId);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ search: "", languageIds: [], interestIds: [] });
  };

  const hasActiveFilters =
    !!filters.search ||
    filters.languageIds.length > 0 ||
    filters.interestIds.length > 0;

  const isLoading = isLoadingUsers || isLoadingLanguages || isLoadingInterests;

  // Handle error
  if (usersError) {
    handleErrorApi({ error: usersError, tError });
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <IconSparkles className="h-8 w-8 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Filters */}
      <MatchingFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        languages={languages}
        interests={interests}
        isLoading={isLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Users Grid */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onViewProfile={handleViewProfile}
              onAddFriend={handleAddFriend}
              // Mock data - in real scenario, fetch from backend
              speakingLanguages={[]}
              learningLanguages={[]}
              interests={[]}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <EmptyMatchingState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}
    </div>
  );
}
