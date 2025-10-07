"use client";

import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { MOCK_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";

type KnownLanguagesStepProps = {
  selected: string[];
  onSelect: (languages: string[]) => void;
  targetLanguages: string[];
};

export function KnownLanguagesStep({
  selected,
  onSelect,
  targetLanguages,
}: KnownLanguagesStepProps) {
  const t = useTranslations("setupProfile.steps.knownLanguages");

  const availableLanguages = MOCK_LANGUAGES.filter(
    (lang) => !targetLanguages.includes(lang.id)
  );

  const toggleLanguage = (languageId: string) => {
    if (selected.includes(languageId)) {
      onSelect(selected.filter((id) => id !== languageId));
    } else {
      onSelect([...selected, languageId]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {availableLanguages.map((language) => {
          const isSelected = selected.includes(language.id);
          return (
            <button
              key={language.id}
              type="button"
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => toggleLanguage(language.id)}
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
          <p className="text-sm font-medium">
            {t("selected", { count: selected.length })}
          </p>
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
