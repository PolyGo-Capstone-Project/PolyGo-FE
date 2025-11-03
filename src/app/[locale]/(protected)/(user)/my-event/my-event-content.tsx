"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  EventsCreatedTab,
  EventsJoinedTab,
  MyEventCalendar,
  MyEventSidebar,
} from "@/components/modules/event/my-event";

export default function MyEventContent() {
  const t = useTranslations("event.myEvent");
  const [activeTab, setActiveTab] = useState<"all" | "created" | "joined">(
    "all"
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - 40% on desktop */}
        <div className="w-full lg:w-[40%]">
          <MyEventSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Calendar - 60% on desktop */}
        <div className="w-full lg:w-[60%]">
          <MyEventCalendar activeTab={activeTab} />
        </div>
      </div>

      {/* Event Cards Section - Only show for created and joined tabs */}
      {activeTab !== "all" && (
        <div className="mt-8">
          {activeTab === "created" && <EventsCreatedTab />}
          {activeTab === "joined" && <EventsJoinedTab />}
        </div>
      )}
    </div>
  );
}
