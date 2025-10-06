"use client";

import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { MOCK_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";

type TargetLanguageStepProps = {
  selected: string[];
  onSelect: (languages: string[]) => void;
};

const MAX_SELECTION = 3;

export function TargetLanguageStep({
  selected,
  onSelect,
}: TargetLanguageStepProps) {
  const t = useTranslations("setupProfile.steps.targetLanguage");

  const toggleLanguage = (languageId: string) => {
    if (selected.includes(languageId)) {
      onSelect(selected.filter((id) => id !== languageId));
    } else if (selected.length < MAX_SELECTION) {
      onSelect([...selected, languageId]);
    }
  };

  const isMaxReached = selected.length >= MAX_SELECTION;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {MOCK_LANGUAGES.map((language) => {
          const isSelected = selected.includes(language.id);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <button
              key={language.id}
              type="button"
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50",
                isDisabled &&
                  "cursor-not-allowed opacity-40 hover:border-border hover:shadow-none"
              )}
              onClick={() => toggleLanguage(language.id)}
              disabled={isDisabled}
            >
              {isSelected && (
                <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <IconCheck className="size-4" />
                </div>
              )}
              <span className="text-4xl">{language.flag}</span>
              <span className="text-center text-sm font-medium">
                {language.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-lg font-bold">{selected.length}</span>
          </div>
          <div className="text-sm">
            <p className="font-medium">
              {t("selected", { count: selected.length })}
            </p>
            {isMaxReached && (
              <p className="text-xs text-primary">{t("maxReached")}</p>
            )}
          </div>
        </div>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect([])}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
