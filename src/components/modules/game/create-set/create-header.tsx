"use client";

import { Button } from "@/components/ui/button";
import { FolderClosed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function CreateHeader() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("create.title")}
        </h1>
        <p className="text-muted-foreground">{t("create.subtitle")}</p>
      </div>
      <Button
        className="w-full sm:w-auto gap-2"
        onClick={() => router.push(`/${locale}/game/my-sets`)}
      >
        <FolderClosed className="h-4 w-4" />
        {t("create.mySets")}
      </Button>
    </div>
  );
}
