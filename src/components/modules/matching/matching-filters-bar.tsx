"use client";

import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MatchingFilters = {
  search: string;
  languageIds: string[];
  interestIds: string[];
};

type MatchingFiltersBarProps = {
  filters: MatchingFilters;
  onFiltersChange: (filters: MatchingFilters) => void;
  languages: Array<{ id: string; name: string }>;
  interests: Array<{ id: string; name: string }>;
  isLoading?: boolean;
};

export function MatchingFiltersBar({
  filters,
  onFiltersChange,
  languages,
  interests,
  isLoading = false,
}: MatchingFiltersBarProps) {
  const t = useTranslations("matching.filters");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleLanguageToggle = (languageId: string) => {
    const newLanguageIds = filters.languageIds.includes(languageId)
      ? filters.languageIds.filter((id) => id !== languageId)
      : [...filters.languageIds, languageId];
    onFiltersChange({ ...filters, languageIds: newLanguageIds });
  };

  const handleInterestToggle = (interestId: string) => {
    const newInterestIds = filters.interestIds.includes(interestId)
      ? filters.interestIds.filter((id) => id !== interestId)
      : [...filters.interestIds, interestId];
    onFiltersChange({ ...filters, interestIds: newInterestIds });
  };

  const handleClearFilters = () => {
    onFiltersChange({ search: "", languageIds: [], interestIds: [] });
  };

  const hasActiveFilters =
    filters.search ||
    filters.languageIds.length > 0 ||
    filters.interestIds.length > 0;

  const getLanguageName = (id: string) =>
    languages.find((l) => l.id === id)?.name || "";
  const getInterestName = (id: string) =>
    interests.find((i) => i.id === id)?.name || "";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconFilter className="h-5 w-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("apply")}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <IconX className="h-4 w-4" />
            ) : (
              <IconFilter className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input - Always Visible */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2">
            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("languages")}</label>
              <Select
                disabled={isLoading || languages.length === 0}
                onValueChange={handleLanguageToggle}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("languagesPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("allLanguages")}</SelectLabel>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {filters.languageIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.languageIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleLanguageToggle(id)}
                    >
                      {getLanguageName(id)}
                      <IconX className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Interest Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("interests")}</label>
              <Select
                disabled={isLoading || interests.length === 0}
                onValueChange={handleInterestToggle}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("interestsPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("allInterests")}</SelectLabel>
                    {interests.map((interest) => (
                      <SelectItem key={interest.id} value={interest.id}>
                        {interest.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {filters.interestIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.interestIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(id)}
                    >
                      {getInterestName(id)}
                      <IconX className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                <IconX className="mr-2 h-4 w-4" />
                {t("clear")}
              </Button>
            )}
          </div>
        )}

        {/* Active Filters Summary (when collapsed) */}
        {!showFilters && hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.languageIds.map((id) => (
              <Badge key={id} variant="secondary">
                {getLanguageName(id)}
              </Badge>
            ))}
            {filters.interestIds.map((id) => (
              <Badge key={id} variant="secondary">
                {getInterestName(id)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
