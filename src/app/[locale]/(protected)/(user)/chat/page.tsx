import { ChatPageContent } from "@/app/[locale]/(protected)/(user)/chat/chat-content";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Chat - PolyGo",
  description: "Chat features and interactions",
};

export default async function Page() {
  const locale = await getLocale();

  return <ChatPageContent locale={locale} />;
}
