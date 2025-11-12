"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Target, Timer, XCircle } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};
function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold mt-1">{value}</div>
        </div>
        <div className="opacity-80">{icon}</div>
      </CardContent>
    </Card>
  );
}

type Props = {
  timeLabel: string;
  timeValue: string;
  progressLabel: string;
  progressValue: string;
  mistakesLabel: string;
  mistakesValue: number;
  hintsLabel?: string;
  hintsValue?: number;
};

export default function StatsRow({
  timeLabel,
  timeValue,
  progressLabel,
  progressValue,
  mistakesLabel,
  mistakesValue,
  hintsLabel,
  hintsValue,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label={timeLabel}
        value={timeValue}
        icon={<Timer className="h-5 w-5" />}
      />
      <StatCard
        label={progressLabel}
        value={progressValue}
        icon={<Target className="h-5 w-5" />}
      />
      <StatCard
        label={mistakesLabel}
        value={mistakesValue}
        icon={<XCircle className="h-5 w-5" />}
      />
      {/* {hintsLabel != null && hintsValue != null && (
        <StatCard
          label={hintsLabel}
          value={hintsValue}
          icon={<Lightbulb className="h-5 w-5" />}
        />
      )} */}
      <StatCard
        // Nếu hintsLabel là null hoặc undefined, dùng "Hints"
        label={hintsLabel ?? "Hints"}
        // Nếu hintsValue là null hoặc undefined, dùng giá trị mặc định (ví dụ: 0)
        value={hintsValue ?? 0}
        icon={<Lightbulb className="h-5 w-5" />}
      />
    </div>
  );
}
