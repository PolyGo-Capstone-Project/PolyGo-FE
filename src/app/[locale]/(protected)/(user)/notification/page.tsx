import NotificationContent from "@/app/[locale]/(protected)/(user)/notification/notification-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications - PolyGo",
  description: "Manage your notifications and interactions",
};

export default async function Page() {
  return <NotificationContent />;
}
