"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

type FiltersBarProps = {
  q: string;
  onQ: (v: string) => void;
  lang: string;
  onLang: (v: string) => void;
  level: string;
  onLevel: (v: string) => void;
  cat: string;
  onCat: (v: string) => void;
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
  const t = useTranslations();

  return (
    <div className="rounded-lg border bg-card p-3 md:p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 md:flex md:flex-row gap-3 md:gap-2 md:justify-end">
        <Input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder={t("wordPuzzle.searchPlaceholder", {
            default: "Search puzzle sets...",
          })}
          className="pl-5"
        />

        <Select value={lang} onValueChange={onLang}>
          <SelectTrigger className="w-full md:w-48 shadow-sm">
            <SelectValue
              placeholder={t("filters.language", { default: "All Languages" })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allLanguages")}</SelectItem>
            <SelectItem value="vi">Vietnamese</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={onLevel}>
          <SelectTrigger className="w-full md:w-44 shadow-sm">
            <SelectValue
              placeholder={t("filters.difficulty", {
                default: "All Difficulties",
              })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allDifficulties")}</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={cat} onValueChange={onCat}>
          <SelectTrigger className="w-full md:w-44 shadow-sm">
            <SelectValue
              placeholder={t("filters.category", { default: "All Categories" })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
