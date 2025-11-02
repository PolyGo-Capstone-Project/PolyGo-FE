"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function MySetsHeader() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("mysets.title", { default: "My Puzzle Sets" })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("mysets.subtitle", {
            default:
              "Manage your created puzzle sets and view your game history",
          })}
        </p>
      </div>

      <Button
        className="gap-2 w-full sm:w-auto"
        onClick={() => router.push(`/${locale}/game/create-set`)}
      >
        <Plus className="h-4 w-4" />
        {t("mysets.createNew", { default: "Create New Puzzle Set" })}
      </Button>
    </div>
  );
}
