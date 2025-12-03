"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Crown, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

type SuggestedFriend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  merit: number;
  planType?: string; // "Free" | "Plus" | ...
};

type OnlineFriend = {
  name: string;
  avatar: string;
  initials: string;
};

type Props = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  suggestedFriends: SuggestedFriend[];
  onlineFriends: OnlineFriend[];
};

export default function FriendSidebar({
  t,
  suggestedFriends,
  onlineFriends,
}: Props) {
  const onlineScrollNeeded = onlineFriends.length > 5;
  const hasSuggestions = suggestedFriends.length > 0;
  const hasOnlineFriends = onlineFriends.length > 0;

  const locale = useLocale();
  const router = useRouter();

  const handleAddFriend = (userId: string) => {
    router.push(`/${locale}/matching/${userId}`);
  };

  const getMeritConfig = (score: number) => {
    if (score <= 40) {
      return {
        color: "text-red-500",
        bg: "bg-red-500/10",
      };
    }
    if (score <= 70) {
      return {
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      };
    }
    return {
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  };

  return (
    <div className="hidden lg:flex flex-col gap-6 overflow-hidden">
      {/* Suggested Friends */}
      <Card className="flex-shrink-0 hover:shadow-md transition-shadow">
        <CardHeader className="border-b sticky top-0 z-10 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
            <UserPlus className="h-5 w-5" />
            {t("rightSidebar.suggestions.title", {
              defaultValue: "Gợi ý kết bạn",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasSuggestions ? (
            suggestedFriends.map((friend) => {
              const meritCfg = getMeritConfig(friend.merit);

              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs">
                        {friend.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {friend.name}
                        </span>
                        {friend.planType === "Plus" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            <Crown className="h-3 w-3" />
                            Plus
                          </span>
                        )}
                      </div>

                      {/* Merit / trust score */}
                      <div
                        className={cn(
                          "inline-flex items-start gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",

                          meritCfg.color
                        )}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{friend.merit}/100</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 h-auto shrink-0 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => handleAddFriend(friend.id)}
                  >
                    {t("rightSidebar.suggestions.add", {
                      defaultValue: "Thêm",
                    })}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("rightSidebar.suggestions.empty", {
                  defaultValue: "Không có gợi ý",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Online Friends */}
      <Card
        className={`hover:shadow-md transition-shadow ${
          hasOnlineFriends ? "flex-1 flex flex-col min-h-0" : "flex-shrink-0"
        }`}
      >
        <CardHeader className="pb-3 border-b flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            {t("rightSidebar.online.title", {
              defaultValue: "Bạn bè đang Online",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`space-y-2 ${
            hasOnlineFriends && onlineScrollNeeded
              ? "overflow-y-auto flex-1"
              : ""
          }`}
          style={onlineScrollNeeded ? { maxHeight: "calc(100vh - 400px)" } : {}}
        >
          {hasOnlineFriends ? (
            onlineFriends.map((friend, idx) => (
              <div
                key={`${friend.initials}-${idx}`}
                className="flex items-center justify-between gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-all flex-shrink-0 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-xs">
                        {friend.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {friend.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("rightSidebar.online.empty", {
                  defaultValue: "Không có bạn bè online",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
