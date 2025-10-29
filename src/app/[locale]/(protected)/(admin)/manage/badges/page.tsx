import ManageBadges from "@/app/[locale]/(protected)/(admin)/manage/badges/badge-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Badges - PolyGo",
  description: "Manage badges on the PolyGo platform",
};

export default function Page() {
  return <ManageBadges />;
}
