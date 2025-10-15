"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export type MatchingFilters = {
  search: string;
  onlineOnly: boolean;
  speakingLanguageIds: string[];
  learningLanguageIds: string[];
  interestIds: string[];
};

type MatchingFilterSidebarProps = {
  filters: MatchingFilters;
  onFiltersChange: (filters: MatchingFilters) => void;
  languages: Array<{
    id: string;
    name: string;
    code: string;
    iconUrl?: string;
  }>;
  interests: Array<{ id: string; name: string; iconUrl?: string }>;
  isLoading?: boolean;
};

export function MatchingFilterSidebar({
  filters,
  onFiltersChange,
  languages,
  interests,
  isLoading = false,
}: MatchingFilterSidebarProps) {
  const t = useTranslations("matching.filters");

  const handleOnlineToggle = () => {
    onFiltersChange({ ...filters, onlineOnly: !filters.onlineOnly });
  };

  const handleSpeakingLanguageToggle = (languageId: string) => {
    const newIds = filters.speakingLanguageIds.includes(languageId)
      ? filters.speakingLanguageIds.filter((id) => id !== languageId)
      : [...filters.speakingLanguageIds, languageId];
    onFiltersChange({ ...filters, speakingLanguageIds: newIds });
  };

  const handleLearningLanguageToggle = (languageId: string) => {
    const newIds = filters.learningLanguageIds.includes(languageId)
      ? filters.learningLanguageIds.filter((id) => id !== languageId)
      : [...filters.learningLanguageIds, languageId];
    onFiltersChange({ ...filters, learningLanguageIds: newIds });
  };

  const handleInterestToggle = (interestId: string) => {
    const newIds = filters.interestIds.includes(interestId)
      ? filters.interestIds.filter((id) => id !== interestId)
      : [...filters.interestIds, interestId];
    onFiltersChange({ ...filters, interestIds: newIds });
  };

  const handleClearAll = () => {
    onFiltersChange({
      search: "",
      onlineOnly: false,
      speakingLanguageIds: [],
      learningLanguageIds: [],
      interestIds: [],
    });
  };

  const hasActiveFilters =
    filters.onlineOnly ||
    filters.speakingLanguageIds.length > 0 ||
    filters.learningLanguageIds.length > 0 ||
    filters.interestIds.length > 0;

  return (
    <aside className="w-full space-y-6">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isLoading}
          >
            {t("clear")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Online Only */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="online-only"
            checked={filters.onlineOnly}
            onCheckedChange={handleOnlineToggle}
            disabled={isLoading}
          />
          <Label
            htmlFor="online-only"
            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("onlineOnly")}
          </Label>
        </div>
      </div>

      <Separator />

      {/* Speaking Languages */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("speakingLanguages")}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {languages.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">{t("allLanguages")}</p>
          )}
          {languages.map((lang) => (
            <div
              key={`speaking-${lang.id}`}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`speaking-${lang.id}`}
                checked={filters.speakingLanguageIds.includes(lang.id)}
                onCheckedChange={() => handleSpeakingLanguageToggle(lang.id)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`speaking-${lang.id}`}
                className="flex items-center gap-2 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {lang.iconUrl && (
                  <Image
                    src={lang.iconUrl}
                    alt={lang.code}
                    className="h-4 w-4 rounded-sm object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {lang.code}
                </span>
                <span>{lang.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Learning Languages */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("learningLanguages")}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {languages.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">{t("allLanguages")}</p>
          )}
          {languages.map((lang) => (
            <div
              key={`learning-${lang.id}`}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`learning-${lang.id}`}
                checked={filters.learningLanguageIds.includes(lang.id)}
                onCheckedChange={() => handleLearningLanguageToggle(lang.id)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`learning-${lang.id}`}
                className="flex items-center gap-2 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {lang.iconUrl && (
                  <Image
                    src={lang.iconUrl}
                    alt={lang.code}
                    className="h-4 w-4 rounded-sm object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {lang.code}
                </span>
                <span>{lang.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Interests */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("interests")}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {interests.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">{t("allInterests")}</p>
          )}
          {interests.map((interest) => (
            <div key={interest.id} className="flex items-center space-x-2">
              <Checkbox
                id={`interest-${interest.id}`}
                checked={filters.interestIds.includes(interest.id)}
                onCheckedChange={() => handleInterestToggle(interest.id)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`interest-${interest.id}`}
                className="flex items-center gap-2 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {interest.iconUrl && (
                  <img
                    src={interest.iconUrl}
                    alt={interest.name}
                    className="h-4 w-4 rounded-sm object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span>{interest.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
