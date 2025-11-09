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
import communicationApiRequest from "@/lib/apis/communication";
import { showErrorToast } from "@/lib/utils";
import { IconEye } from "@tabler/icons-react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const tError = useTranslations("Error");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleChatClick = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setLoadingUserId(userId);

    try {
      // Get or create conversation with this user
      const response =
        await communicationApiRequest.getConversationsByUserId(userId);
      const conversationId = response.payload.data.id;

      // Navigate to chat with conversation ID
      router.push(`/${locale}/chat?conversationId=${conversationId}`);
    } catch (error: any) {
      const errorMessage = error?.payload?.message || "unknownError";
      showErrorToast(errorMessage, tError);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t("suggestedPartners.title", { defaultValue: "Partner gợi ý" })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/matching`)}
          >
            {t("seeAll", { defaultValue: "Xem tất cả" })}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => {
            const initials = getInitials(p.name);
            const showImg = p.avatarUrl && isValidAvatarUrl(p.avatarUrl);

            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/${locale}/matching/${p.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      {showImg ? (
                        <AvatarImage src={p.avatarUrl!} alt={p.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                    {p.speakingLanguages.slice(0, 3).map((lang) => (
                      <Badge
                        key={lang.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {lang.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${locale}/matching/${p.id}`);
                      }}
                    >
                      <IconEye className="w-4 h-4 mr-1" />
                      {t("profile", { defaultValue: "Profile" })}
                    </Button>
                    {/* <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => handleChatClick(e, p.id)}
                      disabled={loadingUserId === p.id}
                    >
                      {loadingUserId === p.id
                        ? t("loading", { defaultValue: "Loading..." })
                        : t("chat", { defaultValue: "Chat" })}
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {partners.length === 0 && (
            <div className="lg:col-span-3 text-center py-8 text-muted-foreground">
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
