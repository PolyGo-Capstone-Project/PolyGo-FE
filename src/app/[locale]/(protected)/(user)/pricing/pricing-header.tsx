"use client";
import { useTranslations } from "next-intl";

export default function HeaderSection() {
  const t = useTranslations("pricing");
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
        {t("title")}
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
        {t("subtitle")}
      </p>
    </div>
  );
}
