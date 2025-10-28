import ManageInterests from "@/app/[locale]/(protected)/(admin)/manage/interests/gift-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Interests - PolyGo",
  description: "Manage interests on the PolyGo platform",
};

export default function Page() {
  return <ManageInterests />;
}
