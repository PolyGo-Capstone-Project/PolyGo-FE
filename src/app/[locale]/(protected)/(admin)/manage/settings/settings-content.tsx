"use client";

import { useTranslations } from "next-intl";

import {
  ChangePasswordSection,
  PersonalInfoSection,
} from "@/components/modules/admin/settings";

export function SettingsContent() {
  const t = useTranslations("admin.settings");

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Content Grid - 4:6 ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Personal Info (4/10) */}
        <div className="lg:col-span-4">
          <PersonalInfoSection />
        </div>

        {/* Right Column - Change Password (6/10) */}
        <div className="lg:col-span-6">
          <ChangePasswordSection />
        </div>
      </div>
    </div>
  );
}
