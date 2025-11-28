"use client";

import { Button } from "@/components/ui/button";
import { useDashboardOverviewQuery } from "@/hooks";
import type { DashboardOverviewQueryType } from "@/models";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import EventsTab from "@/components/modules/admin/admin-dashboard/events-tab";
import OverviewTab from "@/components/modules/admin/admin-dashboard/overview-tab";
import RevenueTab from "@/components/modules/admin/admin-dashboard/revenue-tab";
import UsersTab from "@/components/modules/admin/admin-dashboard/users-tab";

type TimeRange = "7d" | "30d" | "1y" | "custom";
type DashboardTab = "overview" | "revenue" | "users" | "events";

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard.dashboard");

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [showCustom, setShowCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // from/to dùng để gọi API
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // from/to cho input custom
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // Tính from/to cho 7d / 30d / 1y
  useEffect(() => {
    if (timeRange === "custom") return;

    const today = new Date();
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const start = new Date(end);

    if (timeRange === "7d") {
      start.setDate(end.getDate() - 6);
    } else if (timeRange === "30d") {
      start.setDate(end.getDate() - 29);
    } else if (timeRange === "1y") {
      start.setDate(end.getDate() - 364);
    }

    const fromStr = start.toISOString().slice(0, 10);
    const toStr = end.toISOString().slice(0, 10);

    setFrom(fromStr);
    setTo(toStr);
  }, [timeRange]);

  const params: DashboardOverviewQueryType | undefined = useMemo(() => {
    const p: DashboardOverviewQueryType = {};
    if (from) p.from = from;
    if (to) p.to = to;
    return Object.keys(p).length ? p : undefined;
  }, [from, to]);

  const { data, isLoading, isError } = useDashboardOverviewQuery({
    params,
    enabled: !!params,
  });

  const overview = data?.payload?.data;

  const handleSelectRange = (range: TimeRange) => {
    if (range === "custom") {
      setTimeRange("custom");
      setShowCustom(true);
      setCustomFrom(from);
      setCustomTo(to);
    } else {
      setTimeRange(range);
      setShowCustom(false);
    }
  };

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return t("filters.last7Days");
      case "30d":
        return t("filters.last30Days");
      case "1y":
        return t("filters.lastYear");
      case "custom":
        return t("filters.customRange");
      default:
        return "";
    }
  }, [timeRange, t]);

  const tabs = useMemo(
    () => [
      { value: "overview" as const, label: t("tabs.overview") },
      { value: "revenue" as const, label: t("tabs.revenue") },
      { value: "users" as const, label: t("tabs.users") },
      { value: "events" as const, label: t("tabs.events") },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex w-full items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("header.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("header.subtitle")}
          </p>
          {from && to && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("header.rangeLabel")}:{" "}
              <span className="font-medium text-foreground">
                {from} → {to}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustom && (
        <div className="flex w-full flex-wrap items-end gap-4 border-b border-border bg-card/60 px-8 py-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {t("filters.from")}
            </label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {t("filters.to")}
            </label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <Button
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setFrom(customFrom);
              setTo(customTo);
            }}
          >
            {t("filters.apply")}
          </Button>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="w-full px-8 py-4">
        {isLoading && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("state.loading")}
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-10 text-center text-sm text-destructive">
            {t("state.error")}
          </div>
        )}

        {!isLoading && !isError && !overview && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("state.empty")}
          </div>
        )}

        {!isLoading && !isError && overview && (
          <>
            {/* Tabs */}
            <div className="mb-4 flex gap-2 overflow-x-auto border-b">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.value)}
                  className="whitespace-nowrap rounded-b-none"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {activeTab === "overview" && <OverviewTab overview={overview} />}

            {activeTab === "revenue" && (
              <RevenueTab
                overview={overview}
                timeRangeLabel={timeRangeLabel}
                onSelectRange={handleSelectRange}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                overview={overview}
                timeRangeLabel={timeRangeLabel}
                onSelectRange={handleSelectRange}
              />
            )}

            {activeTab === "events" && (
              <EventsTab
                overview={overview}
                timeRangeLabel={timeRangeLabel}
                onSelectRange={handleSelectRange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
