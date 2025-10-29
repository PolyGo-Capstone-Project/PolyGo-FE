import DashboardContent from "@/app/[locale]/(protected)/(user)/dashboard/dashboard-content";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Dashboard - PolyGo",
  description: "Dashboard features and interactions",
};

export default async function Page() {
  const locale = await getLocale();

  return <DashboardContent locale={locale} />;
}
