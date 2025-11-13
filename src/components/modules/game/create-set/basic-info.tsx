"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguagesQuery } from "@/hooks";
import { BookOpen, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function BasicInfo({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  languageId,
  onLanguageChange,
}: {
  title: string;
  description: string;
  languageId: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLanguageChange: (id: string) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();

  const { data: response } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });
  const languages = response?.payload?.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <BookOpen className="h-5 w-5" />
          {t("create.basicInfo.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="title">{t("create.basicInfo.fields.name")} *</Label>
            <Input
              id="title"
              placeholder={t("create.basicInfo.placeholders.name")}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">{t("create.basicInfo.fields.desc")} *</Label>
            <Textarea
              id="desc"
              placeholder={t("create.basicInfo.placeholders.desc")}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="min-h-[84px]"
            />
          </div>
        </div>

        {/* Languages from API */}
        <div className="space-y-2">
          <Label>{t("create.language.label")} *</Label>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
            {languages.map((lang: any) => {
              const active = languageId === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onLanguageChange(lang.id)}
                  className={[
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    active
                      ? "bg-primary/10 border-primary"
                      : "bg-background hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="font-medium line-clamp-1">
                      {lang.name}
                    </span>
                  </div>
                  {lang.code && (
                    <Badge variant="secondary" className="mt-1">
                      {lang.code.toUpperCase()}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
