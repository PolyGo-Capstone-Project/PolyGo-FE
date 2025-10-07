"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("guideline");
  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("intro")}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("conduct.title")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("conduct.items.respect")}</li>
          <li>{t("conduct.items.safety")}</li>
          <li>{t("conduct.items.prohibited")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("enforcement.title")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("enforcement.items.warnings")}</li>
          <li>{t("enforcement.items.bans")}</li>
          <li>{t("enforcement.items.appeals")}</li>
        </ul>
      </section>
    </div>
  );
}
