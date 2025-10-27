"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function SuggestedPartnersGrid({
  partners,
  rating,
  getInitials,
  isValidAvatarUrl,
  locale,
  t,
}: {
  partners: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
    speakingLanguages: Array<{ id: string; name: string }>;
  }>;
  rating: number;
  getInitials: (name: string) => string;
  isValidAvatarUrl: (url?: string | null) => boolean;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">
            {t("suggestedPartners.title", { defaultValue: "Partner gợi ý" })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
            onClick={() => router.push(`/${locale}/matching`)}
          >
            {t("seeAll", { defaultValue: "Xem tất cả" })} →
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => {
            const initials = getInitials(p.name);
            const showImg = p.avatarUrl && isValidAvatarUrl(p.avatarUrl);

            return (
              <Card
                key={p.id}
                className="hover:shadow-md hover:border-purple-200 transition-all border group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-md transition-transform group-hover:scale-105">
                        {showImg ? (
                          <AvatarImage src={p.avatarUrl!} alt={p.name} />
                        ) : null}
                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>⭐</span>
                        <span>{rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4 h-9 overflow-hidden">
                    {p.speakingLanguages.slice(0, 3).map((lang) => (
                      <Badge
                        key={lang.id}
                        variant="secondary"
                        className="text-[11px] bg-slate-100 text-slate-700"
                      >
                        {lang.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 border-slate-200 hover:bg-slate-50 bg-transparent"
                      onClick={() => router.push(`/${locale}/matching/${p.id}`)}
                    >
                      {t("profile", { defaultValue: "Profile" })}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => router.push(`/${locale}/chat`)}
                    >
                      {t("chat", { defaultValue: "Chat" })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {partners.length === 0 && (
            <div className="lg:col-span-3 text-center py-4 text-muted-foreground">
              {t("suggestedPartners.noPartners", {
                defaultValue: "Không tìm thấy partner gợi ý nào.",
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
