"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Language = {
  id: string;
  name: string;
  code: string;
  iconUrl?: string;
};

type ProfileLanguagesSectionProps = {
  nativeLanguages: Language[];
  learningLanguages: Language[];
};

export function ProfileLanguagesSection({
  nativeLanguages,
  learningLanguages,
}: ProfileLanguagesSectionProps) {
  const t = useTranslations("profile.sections");

  return (
    <div className="space-y-4">
      {/* Native Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("nativeLanguages")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {nativeLanguages.length > 0 ? (
              nativeLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-2"
                >
                  {lang.iconUrl && (
                    <Image
                      src={lang.iconUrl}
                      alt={lang.name}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No languages added
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("learningLanguages")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {learningLanguages.length > 0 ? (
              learningLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-2"
                >
                  {lang.iconUrl && (
                    <Image
                      src={lang.iconUrl}
                      alt={lang.name}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No languages added
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
