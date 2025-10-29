import DashboardPage from "@/app/[locale]/(protected)/(admin)/manage/dashboard/dashboard-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Dashboard - PolyGo",
  description: "Manage dashboard on the PolyGo platform",
};

export default function Page() {
  return <DashboardPage />;
}
