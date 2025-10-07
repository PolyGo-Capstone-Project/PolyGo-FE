"use client";

import { useTranslations } from "next-intl";

export default function PoliciesPage() {
  const t = useTranslations("policy");
  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("intro")}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("privacy.title")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("privacy.items.dataProtection")}</li>
          <li>{t("privacy.items.aiLogs")}</li>
          <li>{t("privacy.items.compliance")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("payments.title")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("payments.items.tiers")}</li>
          <li>{t("payments.items.refunds")}</li>
          <li>{t("payments.items.security")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("safety.title")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("safety.items.moderation")}</li>
          <li>{t("safety.items.reports")}</li>
          <li>{t("safety.items.events")}</li>
        </ul>
      </section>
    </div>
  );
}
