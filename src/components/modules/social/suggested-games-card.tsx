"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad } from "lucide-react";

type Props = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  games: { id: string; title: string; subtitle: string; iconColor: string }[];
};

export default function SuggestedGamesCard({ t, games }: Props) {
  const scrollNeeded = games.length > 6;
  const isEmpty = games.length === 0;

  return (
    <div className="hidden lg:block overflow-hidden">
      <Card className={isEmpty ? "" : "h-full"}>
        <CardHeader className="pb-4 border-b sticky top-0 bg-background z-10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gamepad className="h-4 w-4" />
            {t("leftSidebar.games.title", {
              defaultValue: "Trò chơi rèn luyện",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`space-y-2 ${scrollNeeded ? "overflow-y-auto" : "overflow-visible"}`}
          style={scrollNeeded ? { maxHeight: "calc(100vh - 200px)" } : {}}
        >
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Gamepad className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("leftSidebar.games.empty", {
                  defaultValue: "Không có trò chơi",
                })}
              </p>
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div
                  className={`flex-shrink-0 flex items-center justify-center h-8 w-10 text-xs font-bold rounded-md border ${game.iconColor} bg-background/50`}
                >
                  NEW
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {game.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {game.subtitle}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 text-xs py-1 h-auto"
                >
                  {t("leftSidebar.games.play", { defaultValue: "Chơi" })}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
