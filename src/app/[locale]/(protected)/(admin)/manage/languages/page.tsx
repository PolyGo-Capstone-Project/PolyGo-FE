import ManageLanguages from "@/app/[locale]/(protected)/(admin)/manage/languages/language-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Languages - PolyGo",
  description: "Manage languages on the PolyGo platform",
};

export default function Page() {
  return <ManageLanguages />;
}
