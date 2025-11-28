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
import {
  CalendarDays,
  ChevronDown,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatInteger } from "./dashboard-helpers";
import MetricCard from "./metric-card";

type RevenueTabProps = {
  overview: any;
  timeRangeLabel: string;
  onSelectRange: (range: "7d" | "30d" | "1y" | "custom") => void;
};

export default function RevenueTab({
  overview,
  timeRangeLabel,
  onSelectRange,
}: RevenueTabProps) {
  const t = useTranslations("adminDashboard.dashboard");
  const locale = useLocale();

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

  const revenueTrendData =
    overview?.revenue?.trend?.map((it: any) => ({
      label: it.label,
      amount: it.amount,
    })) ?? [];

  const revenueTrendGranularityLabel = useMemo(() => {
    const g = overview?.revenue?.trendGranularity;
    if (!g) return "";
    switch (g) {
      case "daily":
        return t("revenue.trendGranularity.daily");
      case "weekly":
        return t("revenue.trendGranularity.weekly");
      case "monthly":
        return t("revenue.trendGranularity.monthly");
      default:
        return "";
    }
  }, [overview?.revenue?.trendGranularity, t]);

  const subscriptionEntries =
    overview && overview.subscriptions
      ? Object.entries(overview.subscriptions.planBreakdown ?? {})
      : [];

  const subscriptionPieData =
    subscriptionEntries.map(([name, value], index) => ({
      name,
      value: typeof value === "number" ? value : Number(value) || 0,
      fill: `var(--chart-${(index % 5) + 1})`,
    })) ?? [];

  const mostUsedSubscriptionPlan =
    subscriptionEntries.length > 0
      ? subscriptionEntries.reduce(
          (acc, [name, raw]) => {
            const num = typeof raw === "number" ? raw : Number(raw) || 0;
            if (num > acc.count) return { name, count: num };
            return acc;
          },
          (() => {
            const [firstName, firstRaw] = subscriptionEntries[0];
            const firstNum =
              typeof firstRaw === "number" ? firstRaw : Number(firstRaw) || 0;
            return { name: firstName, count: firstNum };
          })()
        )
      : undefined;

  return (
    <div className="space-y-6 px-0 pb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label={t("revenue.metrics.total.label")}
          value={formatCurrency(overview.revenue.totalRevenue, locale)}
          change={`${t(
            "revenue.metrics.total.changePrefix"
          )} ${formatCurrency(overview.revenue.revenueInRange, locale)}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          label={t("revenue.metrics.today.label")}
          value={formatCurrency(overview.revenue.revenueToday, locale)}
          change=""
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <MetricCard
          label={t("revenue.metrics.thisMonth.label")}
          value={formatCurrency(overview.revenue.revenueThisMonth, locale)}
          change=""
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Trend theo filter */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">
              {t("revenue.trendByRange.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("revenue.trendByRange.subtitle", {
                granularity: revenueTrendGranularityLabel,
              })}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {timeRangeLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-border bg-popover text-popover-foreground">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSelectRange("7d")}
              >
                {t("filters.last7Days")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSelectRange("30d")}
              >
                {t("filters.last30Days")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSelectRange("1y")}
              >
                {t("filters.lastYear")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSelectRange("custom")}
              >
                {t("filters.customRange")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={revenueTrendData}
              margin={{ top: 40, right: 24, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis
                stroke="#9ca3af"
                tickFormatter={(value) => `${value} VNĐ`}
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
                formatter={(value) => formatCurrency(Number(value), locale)}
              />
              <Bar
                dataKey="amount"
                fill="var(--chart-4)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hàng 2: trend tổng + pie subscription */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
        <Card className="border-border bg-card lg:col-span-4">
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
                margin={{ top: 40, right: 30, left: 40, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(value) => `${value} VNĐ`}
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
                  formatter={(value) => formatCurrency(Number(value), locale)}
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

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">
              {t("content.subscriptionPlans.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("content.subscriptionPlans.subtitle")}
            </CardDescription>

            {mostUsedSubscriptionPlan && (
              <p className="mt-3 text-md font-bold text-muted-foreground">
                {t("content.subscriptionPlans.mostUsed", {
                  name: mostUsedSubscriptionPlan.name,
                  count: formatInteger(mostUsedSubscriptionPlan.count),
                })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
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
      </div>
    </div>
  );
}
