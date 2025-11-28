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
import { Bell, CheckCircle2, ChevronDown, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatInteger } from "./dashboard-helpers";
import MetricCard from "./metric-card";

type EventsTabProps = {
  overview: any;
  timeRangeLabel: string;
  onSelectRange: (range: "7d" | "30d" | "1y" | "custom") => void;
};

export default function EventsTab({
  overview,
  timeRangeLabel,
  onSelectRange,
}: EventsTabProps) {
  const t = useTranslations("adminDashboard.dashboard");

  const eventsTrendData =
    overview?.events?.newEventsTrend?.map((it: any) => ({
      label: it.label,
      count: it.count,
    })) ?? [];

  const eventsTrendGranularityLabel = (() => {
    const g = overview?.events?.newEventsGranularity;
    if (!g) return "";
    switch (g) {
      case "daily":
        return t("events.trendGranularity.daily");
      case "weekly":
        return t("events.trendGranularity.weekly");
      case "monthly":
        return t("events.trendGranularity.monthly");
      default:
        return "";
    }
  })();

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

  return (
    <div className="space-y-6 px-0 pb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label={t("events.metrics.total.label")}
          value={formatInteger(overview.events.totalEvents)}
          change=""
          icon={<MapPin className="h-5 w-5" />}
        />
        <MetricCard
          label={t("events.metrics.upcoming.label")}
          value={formatInteger(overview.events.upcomingEvents)}
          change=""
          icon={<Bell className="h-5 w-5" />}
        />
        <MetricCard
          label={t("events.metrics.completed.label")}
          value={formatInteger(overview.events.completedEvents)}
          change=""
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Trend theo filter */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">
              {t("events.trendByRange.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("events.trendByRange.subtitle", {
                granularity: eventsTrendGranularityLabel,
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
              data={eventsTrendData}
              margin={{ top: 10, right: 24, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
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
                formatter={(value) => formatInteger(Number(value))}
              />
              <Bar
                dataKey="count"
                fill="var(--chart-5)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Biểu đồ tổng / upcoming / completed / registrations */}
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
    </div>
  );
}
