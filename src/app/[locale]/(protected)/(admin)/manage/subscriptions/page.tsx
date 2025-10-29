import ManageSubscriptions from "@/app/[locale]/(protected)/(admin)/manage/subscriptions/subscription-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Subscriptions - PolyGo",
  description: "Manage subscriptions on the PolyGo platform",
};

export default function Page() {
  return <ManageSubscriptions />;
}
