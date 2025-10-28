"use client";

import { IconFilter, IconX } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useInterestsQuery, useLanguagesQuery } from "@/hooks";

type EventFiltersProps = {
  onFilterChange: (filters: {
    languageIds?: string[];
    interestIds?: string[];
    fee?: "Free" | "Paid";
  }) => void;
  currentFilters: {
    languageIds?: string[];
    interestIds?: string[];
    fee?: "Free" | "Paid";
  };
};

export function EventFilters({
  onFilterChange,
  currentFilters,
}: EventFiltersProps) {
  const t = useTranslations("event.filters");
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const [localFilters, setLocalFilters] = useState(currentFilters);

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
    currentFilters.fee;

  const handleApply = () => {
    onFilterChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyFilters = {
      languageIds: undefined,
      interestIds: undefined,
      fee: undefined,
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <IconFilter className="h-4 w-4" />
          {t("title")}
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {(currentFilters.languageIds?.length || 0) +
                (currentFilters.interestIds?.length || 0) +
                (currentFilters.fee ? 1 : 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{t("title")}</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs"
              >
                <IconX className="mr-1 h-3 w-3" />
                {t("clearFilters")}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Language Filter */}
            <div className="space-y-2">
              <Label>{t("language")}</Label>
              <Select
                value={localFilters.languageIds?.[0] || "all"}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    languageIds: value === "all" ? undefined : [value],
                  })
                }
              >
                <SelectTrigger>
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

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select
                value={localFilters.interestIds?.[0] || "all"}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    interestIds: value === "all" ? undefined : [value],
                  })
                }
              >
                <SelectTrigger>
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

            {/* Price Filter */}
            <div className="space-y-2">
              <Label>{t("price")}</Label>
              <Select
                value={localFilters.fee || "all"}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    fee:
                      value === "all" ? undefined : (value as "Free" | "Paid"),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("allPrices")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allPrices")}</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            {t("apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
