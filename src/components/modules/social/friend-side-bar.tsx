"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle, UserPlus, Users } from "lucide-react";

type Props = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  suggestedFriends: { name: string; avatar: string; initials: string }[];
  onlineFriends: { name: string; avatar: string; initials: string }[];
};

export default function FriendSidebar({
  t,
  suggestedFriends,
  onlineFriends,
}: Props) {
  const onlineScrollNeeded = onlineFriends.length > 5;

  return (
    <div className="hidden lg:flex flex-col h-full gap-6 overflow-hidden">
      {/* Suggested Friends */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-4 border-b sticky top-0 bg-background z-10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {t("rightSidebar.suggestions.title", {
              defaultValue: "Gợi ý kết bạn",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {suggestedFriends.map((friend) => (
            <div
              key={friend.initials}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{friend.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1 h-auto bg-transparent"
              >
                {t("rightSidebar.suggestions.add", { defaultValue: "Thêm" })}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Online Friends */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-4 border-b flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("rightSidebar.online.title", {
              defaultValue: "Bạn bè đang Online",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`pt-4 space-y-3 flex-1 ${onlineScrollNeeded ? "overflow-y-auto" : "overflow-visible"}`}
        >
          {onlineFriends.map((friend, idx) => (
            <div
              key={`${friend.initials}-${idx}`}
              className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                </div>
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
