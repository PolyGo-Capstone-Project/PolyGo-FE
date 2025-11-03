import GiftsContent from "@/app/[locale]/(protected)/(user)/gifts/gift-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Gifts - PolyGo",
  description: "Manage your gifts and interactions",
};

export default async function Page() {
  return <GiftsContent />;
}
