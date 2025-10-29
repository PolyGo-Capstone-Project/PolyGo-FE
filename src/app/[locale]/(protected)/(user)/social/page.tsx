import SocialContent from "@/app/[locale]/(protected)/(user)/social/social-content";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Social - PolyGo",
  description: "Social features and interactions",
};

export default async function Page() {
  const locale = await getLocale();

  return <SocialContent locale={locale} />;
}
