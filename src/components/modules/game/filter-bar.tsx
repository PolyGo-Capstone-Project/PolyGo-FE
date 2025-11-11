"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguagesQuery } from "@/hooks";
import { WordsetCategory, WordsetDifficulty } from "@/models";
import { useLocale, useTranslations } from "next-intl";

type FiltersBarProps = {
  q: string;
  onQ: (v: string) => void;
  lang: string;
  onLang: (v: string) => void;
  level: "all" | WordsetDifficulty;
  onLevel: (v: "all" | WordsetDifficulty) => void;
  cat: "all" | WordsetCategory;
  onCat: (v: "all" | WordsetCategory) => void;
};

export default function FiltersBar({
  q,
  onQ,
  lang,
  onLang,
  level,
  onLevel,
  cat,
  onCat,
}: FiltersBarProps) {
  const t = useTranslations("filters");
  const locale = useLocale();

  const { data: languagesData } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });
  const languages = languagesData?.payload?.data?.items ?? [];

  const difficulties = Object.values(WordsetDifficulty);
  const categories = Object.values(WordsetCategory);

  return (
    <div className="rounded-lg border bg-card p-3 md:p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 md:flex md:flex-row gap-3 md:gap-2 md:justify-end">
        {/* Search */}
        <Input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder={t("searchPlaceholder", {
            default: "Search puzzle sets...",
          })}
          className="pl-5"
        />

        {/* Language */}
        <Select value={lang} onValueChange={onLang}>
          <SelectTrigger className="w-full md:w-48 shadow-sm">
            <SelectValue placeholder={t("language", { default: "Language" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("allLanguages", { default: "All" })}
            </SelectItem>
            {languages.map((l: any) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty */}
        <Select value={level} onValueChange={(v) => onLevel(v as any)}>
          <SelectTrigger className="w-full md:w-44 shadow-sm">
            <SelectValue
              placeholder={t("difficulty", { default: "Difficulty" })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("allDifficulties", { default: "All" })}
            </SelectItem>
            {difficulties.map((d) => (
              <SelectItem key={d} value={d}>
                {t(`wordset.difficulty.${d}`, { default: d })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={cat} onValueChange={(v) => onCat(v as any)}>
          <SelectTrigger className="w-full md:w-44 shadow-sm">
            <SelectValue placeholder={t("category", { default: "Category" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("allCategories", { default: "All" })}
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`wordset.category.${c}`, { default: c })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
