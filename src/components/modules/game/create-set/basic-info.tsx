"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Languages } from "lucide-react";
import { useTranslations } from "next-intl";

/* ===== types & mock data chỉ dùng ở BasicInfo ===== */
type LanguageOption = { code: string; label: string; badge?: string };

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "US English", badge: "US" },
  { code: "vi", label: "VN Vietnamese", badge: "VN" },
  { code: "fr", label: "FR French", badge: "FR" },
  { code: "es", label: "ES Spanish", badge: "ES" },
  { code: "de", label: "DE German", badge: "DE" },
  { code: "jp", label: "JP Japanese", badge: "JP" },
  { code: "kr", label: "KR Korean", badge: "KR" },
  { code: "cn", label: "CN Chinese", badge: "CN" },
  { code: "it", label: "IT Italian", badge: "IT" },
  { code: "br", label: "BR Portuguese", badge: "BR" },
];

export default function BasicInfo({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  languageCode,
  onLanguageChange,
}: {
  title: string;
  description: string;
  languageCode: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLanguageChange: (code: string) => void;
}) {
  const t = useTranslations();

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

        {/* Languages */}
        <div className="space-y-2">
          <Label>{t("create.language.label")} *</Label>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
              const active = languageCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
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
                      {lang.label}
                    </span>
                  </div>
                  {lang.badge && (
                    <Badge variant="secondary" className="mt-1">
                      {lang.badge}
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
