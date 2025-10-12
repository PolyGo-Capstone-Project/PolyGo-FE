"use client";

import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui";
import { useInterestsQuery } from "@/hooks";
import { cn } from "@/lib/utils";

type InterestsStepProps = {
  interests: string[];
  onInterestsChange: (interests: string[]) => void;
};

export function InterestsStep({
  interests,
  onInterestsChange,
}: InterestsStepProps) {
  const t = useTranslations("setupProfile.steps.interests");
  const locale = useLocale();

  const { data, isLoading, isError } = useInterestsQuery({
    params: { lang: locale, pageSize: 100 },
  });

  const interestList = data?.payload.data.items || [];

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      onInterestsChange(interests.filter((id) => id !== interestId));
    } else {
      onInterestsChange([...interests, interestId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || interestList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold">{t("noInterestsFound")}</p>
        <p className="text-sm text-muted-foreground">
          {t("noInterestsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{t("heading")}</h3>
        <p className="text-sm text-muted-foreground">{t("subheading")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {interestList.map((interest) => {
          const isSelected = interests.includes(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => toggleInterest(interest.id)}
              title={interest.description}
            >
              {isSelected && (
                <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <IconCheck className="size-4" />
                </div>
              )}
              {interest.iconUrl ? (
                <img
                  src={interest.iconUrl}
                  alt={interest.name}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl">💡</span>
              )}
              <span className="text-center text-xs font-medium leading-tight">
                {interest.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      {interests.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-lg font-bold">{interests.length}</span>
            </div>
            <p className="text-sm font-medium">
              {t("selected", { count: interests.length })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInterestsChange([])}
            className="text-muted-foreground"
          >
            {t("clearAll")}
          </Button>
        </div>
      )}

      {/* Optional Notice */}
      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">{t("skipNotice")}</p>
      </div>
    </div>
  );
}
