"use client";

import { IconCheck, IconClock } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from "@/components";
import {
  AVAILABILITY_TIMES,
  COMMON_TIMEZONES,
  WEEKLY_HOURS,
} from "@/constants/languages";
import { cn } from "@/lib/utils";

type AvailabilityStepProps = {
  availableTimes: string[];
  timezone: string;
  weeklyHours: number;
  onAvailableTimesChange: (times: string[]) => void;
  onTimezoneChange: (timezone: string) => void;
  onWeeklyHoursChange: (hours: number) => void;
};

export function AvailabilityStep({
  availableTimes,
  timezone,
  weeklyHours,
  onAvailableTimesChange,
  onTimezoneChange,
  onWeeklyHoursChange,
}: AvailabilityStepProps) {
  const t = useTranslations("setupProfile");

  const toggleTime = (timeId: string) => {
    if (availableTimes.includes(timeId)) {
      onAvailableTimesChange(availableTimes.filter((id) => id !== timeId));
    } else {
      onAvailableTimesChange([...availableTimes, timeId]);
    }
  };

  const getWeeklyHoursLabel = (value: number) => {
    return t(`weeklyHours.${value}`);
  };

  const selectedTimezone = COMMON_TIMEZONES.find((tz) => tz.value === timezone);

  return (
    <div className="space-y-10">
      {/* Timezone Selection */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <IconClock className="size-5" />
            {t("steps.availability.timezoneHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("steps.availability.timezoneSubheading")}
          </p>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTimezone && (
            <p className="text-xs text-muted-foreground">
              {t("steps.availability.currentTime")}:{" "}
              {new Date().toLocaleTimeString("en-US", {
                timeZone: selectedTimezone.value,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          )}
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            {t("steps.availability.timeSlotsHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("steps.availability.timeSlotsSubheading")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {AVAILABILITY_TIMES.map((timeSlot) => {
            const isSelected = availableTimes.includes(timeSlot.id);
            return (
              <button
                key={timeSlot.id}
                type="button"
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => toggleTime(timeSlot.id)}
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <IconCheck className="size-4" />
                  </div>
                )}
                <span className="text-3xl">{timeSlot.icon}</span>
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {t(`availability.${timeSlot.id}.label`)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(`availability.${timeSlot.id}.time`)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {availableTimes.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-lg font-bold">
                  {availableTimes.length}
                </span>
              </div>
              <p className="text-sm font-medium">
                {t("steps.availability.selected", {
                  count: availableTimes.length,
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAvailableTimesChange([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Weekly Hours */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            {t("steps.availability.weeklyHoursHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("steps.availability.weeklyHoursSubheading")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("steps.availability.weeklyHoursLabel")}</Label>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {getWeeklyHoursLabel(weeklyHours)}
              </span>
            </div>
            <Slider
              value={[weeklyHours]}
              onValueChange={(value) => onWeeklyHoursChange(value[0])}
              min={1}
              max={11}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {WEEKLY_HOURS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onWeeklyHoursChange(option.value)}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all hover:shadow-md",
                  weeklyHours === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {t(`weeklyHours.${option.value}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
