"use client";

import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { INTERESTS, PROFICIENCY_LEVELS } from "@/constants/languages";
import { cn } from "@/lib/utils";

type ProficiencyStepProps = {
  proficiency: string;
  interests: string[];
  onProficiencyChange: (level: string) => void;
  onInterestsChange: (interests: string[]) => void;
};

export function ProficiencyStep({
  proficiency,
  interests,
  onProficiencyChange,
  onInterestsChange,
}: ProficiencyStepProps) {
  const t = useTranslations("setupProfile");

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      onInterestsChange(interests.filter((id) => id !== interestId));
    } else {
      onInterestsChange([...interests, interestId]);
    }
  };

  return (
    <div className="space-y-10">
      {/* Proficiency Level */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            {t("steps.proficiency.proficiencyHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("steps.proficiency.proficiencySubheading")}
          </p>
        </div>

        <RadioGroup value={proficiency} onValueChange={onProficiencyChange}>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROFICIENCY_LEVELS.map((level) => (
              <label
                key={level.id}
                htmlFor={level.id}
                className={cn(
                  "group relative flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                  proficiency === level.id
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem
                  value={level.id}
                  id={level.id}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">
                    {t(`proficiencyLevels.${level.id}.label`)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(`proficiencyLevels.${level.id}.description`)}
                  </div>
                </div>
                {proficiency === level.id && (
                  <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <IconCheck className="size-4" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Interests */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            {t("steps.proficiency.interestsHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("steps.proficiency.interestsSubheading")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {INTERESTS.map((interest) => {
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
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <IconCheck className="size-4" />
                  </div>
                )}
                <span className="text-3xl">{interest.icon}</span>
                <span className="text-center text-xs font-medium leading-tight">
                  {t(`interests.${interest.id}`)}
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
                {t("steps.proficiency.selected", { count: interests.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onInterestsChange([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
