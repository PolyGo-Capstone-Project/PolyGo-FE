"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function UpgradePlusCard({
  t,
}: {
  t?: ReturnType<typeof useTranslations>;
}) {
  const tLocal = useTranslations("dashboard");

  return (
    <Card className="border-0 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <CardContent className="p-6 relative z-10">
        <div className="text-xs font-semibold text-amber-100 mb-2 uppercase tracking-wide">
          {tLocal("upgradePlus.badge", { defaultValue: "Nâng cấp lên Plus" })}
        </div>
        <h3 className="text-lg font-bold mb-4 leading-tight">
          {tLocal("upgradePlus.title", {
            defaultValue: "Mở khóa cuộc gọi không giới hạn",
          })}
        </h3>
        <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold h-10">
          {tLocal("upgradePlus.button", { defaultValue: "Nâng cấp ngay" })} →
        </Button>
      </CardContent>
    </Card>
  );
}
