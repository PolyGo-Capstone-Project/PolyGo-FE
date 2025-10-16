"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  AvailableGiftsTab,
  MyPurchasedGiftsTab,
  MyReceivedGiftsTab,
  MySentGiftsTab,
} from "@/components/modules/gifts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GiftsPage() {
  const t = useTranslations("gift");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("available");

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="available">{t("tabs.available")}</TabsTrigger>
            <TabsTrigger value="purchased">{t("tabs.purchased")}</TabsTrigger>
            <TabsTrigger value="sent">{t("tabs.sent")}</TabsTrigger>
            <TabsTrigger value="received">{t("tabs.received")}</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <AvailableGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="purchased" className="mt-6">
            <MyPurchasedGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <MySentGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <MyReceivedGiftsTab locale={locale} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
