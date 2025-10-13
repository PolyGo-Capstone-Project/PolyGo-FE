import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SettingsContent } from "@/app/[locale]/(protected)/(admin)/manage/settings/settings-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.settings");

  return {
    title: `${t("title")} - PolyGo`,
    description: t("description"),
  };
}

export default function ManageSettingsPage() {
  return <SettingsContent />;
}
