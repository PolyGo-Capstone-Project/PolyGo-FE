import GameContent from "@/app/[locale]/(protected)/(user)/game/game-content";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Game - PolyGo",
  description: "Game features and interactions",
};

export default async function Page() {
  const locale = await getLocale();

  return <GameContent locale={locale} />;
}
