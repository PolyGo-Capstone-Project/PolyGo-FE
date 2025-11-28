import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  Users as UsersIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCurrency,
  formatInteger,
  formatShortNumber,
} from "./dashboard-helpers";
import MetricCard from "./metric-card";

type OverviewTabProps = {
  overview: any; // nếu có type chính xác bạn có thể thay vào
};

export default function OverviewTab({ overview }: OverviewTabProps) {
  const t = useTranslations("adminDashboard.dashboard");
  const locale = useLocale();

  // KPI tổng quan
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
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        label: t("metrics.users.label"),
        value: formatInteger(overview.users.totalUsers),
        change: `${t("metrics.users.changePrefix")} ${formatInteger(
          overview.users.newUsersInRange
        )}`,
        icon: <UsersIcon className="h-5 w-5" />,
      },
      {
        label: t("metrics.events.label"),
        value: formatInteger(overview.events.totalEvents),
        change: `${t("metrics.events.changePrefix")} ${formatInteger(
          overview.events.completedEvents
        )}`,
        icon: <MapPin className="h-5 w-5" />,
      },
    ];
  }, [overview, locale, t]);

  const overviewHorizontalData = overview && [
    {
      metric: t("overviewChart.upcomingEventsLabel"),
      value: overview.events.upcomingEvents,
    },
    {
      metric: t("overviewChart.completedEventsLabel"),
      value: overview.events.completedEvents,
    },
  ];

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

  return (
    <div className="space-y-6 pb-8">
      {/* Metric chung */}
      <div className="grid grid-cols-1 gap-4 px-0 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Content metrics */}
      <div className="grid grid-cols-1 gap-4 px-0 md:grid-cols-3">
        <MetricCard
          label={t("content.metrics.activeSubscriptions.label")}
          value={formatInteger(overview.subscriptions.activeSubscriptions)}
          change={`${t(
            "content.metrics.activeSubscriptions.changePrefix"
          )} ${formatInteger(overview.subscriptions.newSubscriptionsInRange)}`}
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          label={t("content.metrics.socialPosts.label")}
          value={formatInteger(overview.social.totalPosts)}
          change={`${t("content.metrics.socialPosts.changePrefix")} ${formatInteger(
            overview.social.postsInRange
          )}`}
          icon={<MessageCircle className="h-5 w-5" />}
        />
        <MetricCard
          label={t("content.metrics.reports.label")}
          value={formatInteger(overview.reports.totalReports)}
          change={`${t("content.metrics.reports.changePrefix")} ${formatInteger(
            overview.reports.pendingReports
          )}`}
          icon={<Flag className="h-5 w-5" />}
        />
      </div>

      {/* Overview horizontal chart */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  domain={[0, "dataMax"]}
                  tickFormatter={(value) => formatShortNumber(Number(value))}
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

      {/* Revenue breakdown bottom */}
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
                margin={{ top: 40, right: 24, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis
                  stroke="#9ca3af"
                  width={80}
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
                  dataKey="revenue"
                  fill="var(--chart-1)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
