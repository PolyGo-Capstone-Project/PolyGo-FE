"use client";

import { IconCalendar, IconCalendarEvent, IconList } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

type MyEventSidebarProps = {
  activeTab: "all" | "created" | "joined";
  onTabChange: (tab: "all" | "created" | "joined") => void;
};

export function MyEventSidebar({
  activeTab,
  onTabChange,
}: MyEventSidebarProps) {
  const t = useTranslations("event.myEvent.sidebar");

  const tabs = [
    {
      id: "all" as const,
      label: t("all"),
      icon: IconList,
      description: "View all your events in one place",
    },
    {
      id: "created" as const,
      label: t("created"),
      icon: IconCalendarEvent,
      description: "Events you've organized",
    },
    {
      id: "joined" as const,
      label: t("joined"),
      icon: IconCalendar,
      description: "Events you're attending",
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all",
                  "hover:bg-accent-foreground/20",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 flex-shrink-0",
                    isActive && "text-primary-foreground"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {tab.label}
                  </p>
                  {!isActive && (
                    <p className="text-xs text-muted-foreground truncate">
                      {tab.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
