import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { ChatPageContent } from "@/components/modules/chat";

export const metadata: Metadata = {
  title: "Chat - PolyGo",
  description: "Chat features and interactions",
};

export default async function ChatPage() {
  const locale = await getLocale();

  return <ChatPageContent locale={locale} />;
}
