"use client";

import {
  Badge,
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useInterestsQuery, useLanguagesQuery } from "@/hooks";
import {
  IconCalendarTime,
  IconCategory,
  IconCoin,
  IconLanguage,
  IconX,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

type TimeFilterType = "today" | "thisWeek" | "thisMonth";

type EventFiltersProps = {
  onFilterChange: (filters: {
    languageIds?: string[];
    interestIds?: string[];
    fee?: "Free" | "Paid";
    time?: TimeFilterType;
  }) => void;
  currentFilters: {
    languageIds?: string[];
    interestIds?: string[];
    fee?: "Free" | "Paid";
    time?: TimeFilterType;
  };
};

export function EventFilters({
  onFilterChange,
  currentFilters,
}: EventFiltersProps) {
  const t = useTranslations("event.filters");
  const locale = useLocale();

  const { data: languagesData } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });

  const languages = languagesData?.payload?.data?.items || [];
  const interests = interestsData?.payload?.data?.items || [];

  const hasActiveFilters =
    currentFilters.languageIds?.length ||
    currentFilters.interestIds?.length ||
    currentFilters.fee ||
    currentFilters.time;

  const activeFilterCount =
    (currentFilters.languageIds?.length || 0) +
    (currentFilters.interestIds?.length || 0) +
    (currentFilters.fee ? 1 : 0) +
    (currentFilters.time ? 1 : 0);

  const handleClear = () => {
    onFilterChange({
      languageIds: undefined,
      interestIds: undefined,
      fee: undefined,
      time: undefined,
    });
  };

  return (
    <Card className="p-4 rounded-xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-start">
        {/* Language */}
        <div className="flex items-center gap-2 w-full lg:col-span-2">
          <IconLanguage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={currentFilters.languageIds?.[0] || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...currentFilters,
                languageIds: value === "all" ? undefined : [value],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("allLanguages")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allLanguages")}</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 w-full lg:col-span-2">
          <IconCategory className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={currentFilters.interestIds?.[0] || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...currentFilters,
                interestIds: value === "all" ? undefined : [value],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {interests.map((interest) => (
                <SelectItem key={interest.id} value={interest.id}>
                  {interest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fee */}
        <div className="flex items-center gap-2 w-full">
          <IconCoin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={currentFilters.fee || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...currentFilters,
                fee: value === "all" ? undefined : (value as "Free" | "Paid"),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("allPrices")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allPrices")}</SelectItem>
              <SelectItem value="Free">{t("freeOnly")}</SelectItem>
              <SelectItem value="Paid">{t("paidOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2 w-full">
          <IconCalendarTime className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={currentFilters.time || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...currentFilters,
                time: value === "all" ? undefined : (value as TimeFilterType),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("allTimes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTimes")}</SelectItem>
              <SelectItem value="today">{t("today")}</SelectItem>
              <SelectItem value="thisWeek">{t("thisWeek")}</SelectItem>
              <SelectItem value="thisMonth">{t("thisMonth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="justify-center text-sm py-1 px-2 h-[38px]"
        >
          <IconX className="h-4 w-4 mr-1" />
          {t("clearFilters")}
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="ml-1 text-[10px] rounded-full px-1.5 py-0 h-4"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {currentFilters.languageIds?.map((langId) => {
            const lang = languages.find((l) => l.id === langId);
            return (
              lang && (
                <Badge
                  key={langId}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition"
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      languageIds: undefined,
                    })
                  }
                >
                  {lang.name}
                  <IconX className="h-3 w-3" />
                </Badge>
              )
            );
          })}

          {currentFilters.interestIds?.map((intId) => {
            const interest = interests.find((i) => i.id === intId);
            return (
              interest && (
                <Badge
                  key={intId}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition"
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      interestIds: undefined,
                    })
                  }
                >
                  {interest.name}
                  <IconX className="h-3 w-3" />
                </Badge>
              )
            );
          })}

          {currentFilters.fee && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition"
              onClick={() =>
                onFilterChange({ ...currentFilters, fee: undefined })
              }
            >
              {currentFilters.fee === "Free" ? t("freeOnly") : t("paidOnly")}
              <IconX className="h-3 w-3" />
            </Badge>
          )}

          {currentFilters.time && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition"
              onClick={() =>
                onFilterChange({ ...currentFilters, time: undefined })
              }
            >
              {t(currentFilters.time)}
              <IconX className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
