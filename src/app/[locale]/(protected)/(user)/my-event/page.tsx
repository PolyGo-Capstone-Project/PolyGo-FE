import MyEventContent from "@/app/[locale]/(protected)/(user)/my-event/my-event-content";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "My Events - PolyGo",
  description: "Manage your events and interactions",
};

export default async function Page() {
  const locale = await getLocale();
  return <MyEventContent locale={locale} />;
}
