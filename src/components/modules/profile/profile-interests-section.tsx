"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Interest = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
};

type ProfileInterestsSectionProps = {
  interests: Interest[];
};

export function ProfileInterestsSection({
  interests,
}: ProfileInterestsSectionProps) {
  const t = useTranslations("profile.sections");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("interests")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {interests.length > 0 ? (
            interests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 transition-colors hover:bg-muted/50"
              >
                {interest.iconUrl && (
                  <Image
                    src={interest.iconUrl}
                    alt={interest.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
                <span className="text-sm font-medium">{interest.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No interests added</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
