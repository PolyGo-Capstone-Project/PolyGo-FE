import ManageGifts from "@/app/[locale]/(protected)/(admin)/manage/gifts/gift-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Gifts - PolyGo",
  description: "Manage gifts on the PolyGo platform",
};

export default function Page() {
  return <ManageGifts />;
}
