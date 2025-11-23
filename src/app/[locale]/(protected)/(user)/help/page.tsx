import HelpContent from "@/app/[locale]/(protected)/(user)/help/help-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - PolyGo",
  description: "Get assistance and find answers to your questions",
};

export default async function Page() {
  return <HelpContent />;
}
