"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDashboardOverviewQuery } from "@/hooks";
import type { DashboardOverviewQueryType } from "@/models";
import { useLocale, useTranslations } from "next-intl";

/* ========= Helpers ========= */

type TimeRange = "7d" | "30d" | "1y" | "custom";

const formatCurrency = (value: number | undefined, locale: string) => {
  if (!value || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatInteger = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString();
};

/** Rút gọn số lớn: 1500 -> 1.5K, 2000000 -> 2.0M */
const formatShortNumber = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return "-";
  const n = value;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  icon: string;
}

function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-xl text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-emerald-500">{change}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard.dashboard");
  const locale = useLocale();

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [showCustom, setShowCustom] = useState(false);

  // from/to dùng để gọi API
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // from/to cho input custom (chỉ apply khi nhấn Apply)
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // tính from/to cho 7d / 30d / 1y
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

  /* ======= Data cho charts & cards ======= */

  const overviewMetricCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: t("metrics.totalRevenue.label"),
        value: formatCurrency(overview.revenue.totalRevenue, locale),
        change: `${t("metrics.totalRevenue.changePrefix")} ${formatCurrency(
          overview.revenue.revenueInRange,
          locale
        )}`,
        icon: "$",
      },
      {
        label: t("metrics.subscriptions.label"),
        value: formatInteger(overview.subscriptions.activeSubscriptions),
        change: `${t("metrics.subscriptions.changePrefix")} ${formatInteger(
          overview.subscriptions.newSubscriptionsInRange
        )}`,
        icon: "📦",
      },
      {
        label: t("metrics.users.label"),
        value: formatInteger(overview.users.totalUsers),
        change: `${t("metrics.users.changePrefix")} ${formatInteger(
          overview.users.newUsersInRange
        )}`,
        icon: "👥",
      },
      {
        label: t("metrics.events.label"),
        value: formatInteger(overview.events.totalEvents),
        change: `${t("metrics.events.changePrefix")} ${formatInteger(
          overview.events.completedEvents
        )}`,
        icon: "📍",
      },
    ];
  }, [overview, locale, t]);

  // Overview chart: Users / Events
  const overviewHorizontalData = overview && [
    {
      metric: t("overviewChart.usersLabel"),
      value: overview.users.newUsersInRange,
    },
    {
      metric: t("overviewChart.eventsLabel"),
      value: overview.events.completedEvents,
    },
  ];

  // Revenue chart (Today / Week / Month / Year)
  const revenueChartData = overview && [
    {
      label: t("revenue.breakdown.today"),
      revenue: overview.revenue.revenueToday,
    },
    {
      label: t("revenue.breakdown.thisWeek"),
      revenue: overview.revenue.revenueThisWeek,
    },
    {
      label: t("revenue.breakdown.thisMonth"),
      revenue: overview.revenue.revenueThisMonth,
    },
    {
      label: t("revenue.breakdown.thisYear"),
      revenue: overview.revenue.revenueThisYear,
    },
  ];

  // Users line chart
  const usersChartData = overview && [
    { label: t("usersChart.total"), users: overview.users.totalUsers },
    { label: t("usersChart.newRange"), users: overview.users.newUsersInRange },
    {
      label: t("usersChart.active7days"),
      users: overview.users.activeUsersLast7Days,
    },
  ];

  // Events line chart
  const eventsChartData = overview && [
    { label: t("eventsChart.total"), events: overview.events.totalEvents },
    {
      label: t("eventsChart.upcoming"),
      events: overview.events.upcomingEvents,
    },
    {
      label: t("eventsChart.completed"),
      events: overview.events.completedEvents,
    },
    {
      label: t("eventsChart.registrations"),
      events: overview.events.totalRegistrations,
    },
  ];

  // Content / subscriptions pie chart
  const subscriptionPieData =
    overview &&
    Object.entries(overview.subscriptions.planBreakdown ?? {}).map(
      ([name, value], index) => ({
        name,
        value: typeof value === "number" ? value : Number(value) || 0,
        fill: `var(--chart-${(index % 5) + 1})`,
      })
    );

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
      { value: "overview", label: t("tabs.overview") },
      { value: "revenue", label: t("tabs.revenue") },
      { value: "users", label: t("tabs.users") },
      { value: "events", label: t("tabs.events") },
      { value: "content", label: t("tabs.content") },
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

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {timeRangeLabel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-border bg-popover text-popover-foreground">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setTimeRange("7d");
                setShowCustom(false);
              }}
            >
              {t("filters.last7Days")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setTimeRange("30d");
                setShowCustom(false);
              }}
            >
              {t("filters.last30Days")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setTimeRange("1y");
                setShowCustom(false);
              }}
            >
              {t("filters.lastYear")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setTimeRange("custom");
                setShowCustom(true);
                setCustomFrom(from);
                setCustomTo(to);
              }}
            >
              {t("filters.customRange")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Custom Date Range Inputs */}
      {showCustom && (
        <div className="flex w-full items-end gap-4 border-b border-border bg-card/60 px-8 py-4">
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
          <Tabs defaultValue="overview" className="w-full">
            {/* Navigation Tabs */}
            <TabsList
              className="
                h-auto gap-8 bg-transparent p-0 
                border-0
              "
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="shadow-blackxl"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ===== Overview Tab ===== */}
            <TabsContent value="overview" className="mt-6 space-y-6 pb-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 gap-4 px-0 md:grid-cols-2 lg:grid-cols-4">
                {overviewMetricCards.map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    change={m.change}
                    icon={m.icon}
                  />
                ))}
              </div>

              {/* Overview horizontal chart: Users, Events */}
              <div className="mt-2">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {t("overviewChart.title")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {t("overviewChart.description")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        layout="vertical"
                        data={overviewHorizontalData}
                        margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb33"
                        />
                        <XAxis
                          type="number"
                          stroke="#9ca3af"
                          domain={[0, "dataMax"]}
                          tickFormatter={(value) =>
                            formatShortNumber(Number(value))
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="metric"
                          stroke="#9ca3af"
                          width={80}
                        />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          labelStyle={{
                            color: "hsl(var(--popover-foreground))",
                          }}
                          itemStyle={{
                            color: "hsl(var(--foreground))",
                            fontWeight: 500,
                          }}
                          formatter={(value) => formatInteger(Number(value))}
                        />
                        <Bar
                          dataKey="value"
                          fill="var(--chart-2)"
                          radius={[0, 8, 8, 0]}
                          minPointSize={12}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Section: Revenue breakdown */}
              <div className="grid grid-cols-1 gap-6 px-0">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {t("revenue.breakdown.title")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {t("revenue.breakdown.subtitle")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={revenueChartData}
                        margin={{ top: 10, right: 24, left: 40, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb33"
                        />
                        <XAxis dataKey="label" stroke="#9ca3af" />
                        <YAxis
                          stroke="#9ca3af"
                          width={80}
                          // tickFormatter={(value) => formatShortNumber(Number(value))}
                        />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{
                            color: "hsl(var(--popover-foreground))",
                          }}
                          itemStyle={{
                            color: "hsl(var(--foreground))",
                            fontWeight: 500,
                          }}
                          formatter={(value) =>
                            formatCurrency(Number(value), locale)
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          fill="var(--chart-1)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ===== Revenue Tab ===== */}
            <TabsContent value="revenue" className="mt-6 space-y-6 px-0 pb-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MetricCard
                  label={t("revenue.metrics.total.label")}
                  value={formatCurrency(overview.revenue.totalRevenue, locale)}
                  change={`${t("revenue.metrics.total.changePrefix")} ${formatCurrency(
                    overview.revenue.revenueInRange,
                    locale
                  )}`}
                  icon="$"
                />
                <MetricCard
                  label={t("revenue.metrics.today.label")}
                  value={formatCurrency(overview.revenue.revenueToday, locale)}
                  change=""
                  icon="📅"
                />
                <MetricCard
                  label={t("revenue.metrics.thisMonth.label")}
                  value={formatCurrency(
                    overview.revenue.revenueThisMonth,
                    locale
                  )}
                  change=""
                  icon="📈"
                />
              </div>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t("revenue.trend.title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("revenue.trend.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={revenueChartData}
                      margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis
                        stroke="#9ca3af"
                        // tickFormatter={(value) => formatShortNumber(Number(value))}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                        formatter={(value) =>
                          formatCurrency(Number(value), locale)
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--chart-1)"
                        fill="url(#fillRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== Users Tab ===== */}
            <TabsContent value="users" className="mt-6 space-y-6 px-0 pb-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MetricCard
                  label={t("users.metrics.total.label")}
                  value={formatInteger(overview.users.totalUsers)}
                  change={`${t("users.metrics.total.changePrefix")} ${formatInteger(
                    overview.users.newUsersInRange
                  )}`}
                  icon="👥"
                />
                <MetricCard
                  label={t("users.metrics.active7days.label")}
                  value={formatInteger(overview.users.activeUsersLast7Days)}
                  change=""
                  icon="✅"
                />
                <MetricCard
                  label={t("users.metrics.newRange.label")}
                  value={formatInteger(overview.users.newUsersInRange)}
                  change=""
                  icon="⭐"
                />
              </div>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t("users.trend.title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("users.trend.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={usersChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== Events Tab ===== */}
            <TabsContent value="events" className="mt-6 space-y-6 px-0 pb-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MetricCard
                  label={t("events.metrics.total.label")}
                  value={formatInteger(overview.events.totalEvents)}
                  change=""
                  icon="📍"
                />
                <MetricCard
                  label={t("events.metrics.upcoming.label")}
                  value={formatInteger(overview.events.upcomingEvents)}
                  change=""
                  icon="🔔"
                />
                <MetricCard
                  label={t("events.metrics.completed.label")}
                  value={formatInteger(overview.events.completedEvents)}
                  change=""
                  icon="✅"
                />
              </div>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t("events.trend.title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("events.trend.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={eventsChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="events"
                        stroke="var(--chart-3)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== Content Tab ===== */}
            <TabsContent value="content" className="mt-6 space-y-6 px-0 pb-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MetricCard
                  label={t("content.metrics.activeSubscriptions.label")}
                  value={formatInteger(
                    overview.subscriptions.activeSubscriptions
                  )}
                  change={`${t("content.metrics.activeSubscriptions.changePrefix")} ${formatInteger(
                    overview.subscriptions.newSubscriptionsInRange
                  )}`}
                  icon="📦"
                />
                <MetricCard
                  label={t("content.metrics.socialPosts.label")}
                  value={formatInteger(overview.social.totalPosts)}
                  change={`${t("content.metrics.socialPosts.changePrefix")} ${formatInteger(
                    overview.social.postsInRange
                  )}`}
                  icon="📱"
                />
                <MetricCard
                  label={t("content.metrics.reports.label")}
                  value={formatInteger(overview.reports.totalReports)}
                  change={`${t("content.metrics.reports.changePrefix")} ${formatInteger(
                    overview.reports.pendingReports
                  )}`}
                  icon="📄"
                />
              </div>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {t("content.subscriptionPlans.title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("content.subscriptionPlans.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      />
                      <Pie
                        data={subscriptionPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
