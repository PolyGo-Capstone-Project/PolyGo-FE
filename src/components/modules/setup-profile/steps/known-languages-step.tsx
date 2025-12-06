"use client";

import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui";
import { useLanguagesQuery } from "@/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";

type KnownLanguagesStepProps = {
  selected: string[];
  onSelect: (languages: string[]) => void;
};

export function KnownLanguagesStep({
  selected,
  onSelect,
}: KnownLanguagesStepProps) {
  const t = useTranslations("setupProfile.steps.knownLanguages");
  const locale = useLocale();

  const { data, isLoading, isError } = useLanguagesQuery({
    params: { lang: locale, pageSize: 100 },
  });

  const languages = data?.payload.data.items || [];

  const toggleLanguage = (languageId: string) => {
    if (selected.includes(languageId)) {
      onSelect(selected.filter((id) => id !== languageId));
    } else {
      onSelect([...selected, languageId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || languages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold">{t("noLanguagesFound")}</p>
        <p className="text-sm text-muted-foreground">
          {t("noLanguagesDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {languages.map((language) => {
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
              {language.iconUrl ? (
                <Image
                  src={language.iconUrl}
                  alt={language.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl">🌐</span>
              )}
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
            {t("clearAll")}
          </Button>
        )}
      </div>
    </div>
  );
}
