import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

export type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
};

export default function MetricCard({
  label,
  value,
  change,
  icon,
}: MetricCardProps) {
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
        {!!change && <p className="text-xs text-emerald-500">{change}</p>}
      </CardContent>
    </Card>
  );
}
