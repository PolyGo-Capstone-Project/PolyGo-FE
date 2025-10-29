"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function UpgradePlusCard({
  t,
  locale,
}: {
  t?: ReturnType<typeof useTranslations>;
  locale?: string;
}) {
  const tLocal = useTranslations("dashboard");
  const router = useRouter();

  const handleUpgrade = () => {
    if (locale) {
      router.push(`/${locale}/pricing`);
    } else {
      router.push("/pricing");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {tLocal("upgradePlus.badge", { defaultValue: "Nâng cấp lên Plus" })}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-4">
          {tLocal("upgradePlus.title", {
            defaultValue: "Mở khóa cuộc gọi không giới hạn",
          })}
        </h3>

        <Button onClick={handleUpgrade} variant="secondary" className="w-full">
          {tLocal("upgradePlus.button", { defaultValue: "Nâng cấp ngay" })}
        </Button>
      </CardContent>
    </Card>
  );
}
