"use client";

import { IconGift, IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  AvailableGiftsTab,
  MyPurchasedGiftsTab,
  MyReceivedGiftsTab,
  MySentGiftsTab,
} from "@/components/modules/gifts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GiftsContent() {
  const t = useTranslations("gift");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("available");

  const tabs = [
    {
      value: "available",
      label: t("tabs.available"),
      icon: IconSparkles,
    },
    {
      value: "purchased",
      label: t("tabs.purchased"),
      icon: IconGift,
    },
    {
      value: "sent",
      label: t("tabs.sent"),
      icon: IconGift,
    },
    {
      value: "received",
      label: t("tabs.received"),
      icon: IconGift,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12 text-primary-foreground shadow-2xl"
      >
        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        {/* Floating Icons */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-12 top-12 opacity-20"
        >
          <IconGift className="h-24 w-24" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-12 left-12 opacity-20"
        >
          <IconSparkles className="h-20 w-20" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
          >
            <IconSparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Gift Store</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-5xl font-bold tracking-tight md:text-6xl"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-primary-foreground/90 md:text-xl"
          >
            Browse, purchase, and send amazing gifts to your friends and
            language exchange partners
          </motion.p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative h-auto flex-col gap-2 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:shadow-lg"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 -z-10 rounded-xl bg-primary"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="available" className="mt-8">
            <AvailableGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="purchased" className="mt-8">
            <MyPurchasedGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="sent" className="mt-8">
            <MySentGiftsTab locale={locale} />
          </TabsContent>

          <TabsContent value="received" className="mt-8">
            <MyReceivedGiftsTab locale={locale} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
