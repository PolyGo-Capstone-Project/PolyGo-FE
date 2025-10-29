"use client";

import {
  Button,
  Calendar,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

interface DateTimePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  showLabel?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  disabled = false,
  label,
  showLabel = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert value to Date if it's a string (ISO)
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return value;
  }, [value]);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    dateValue
  );
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (dateValue) {
      const hours = String(dateValue.getHours()).padStart(2, "0");
      const minutes = String(dateValue.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "10:00";
  });

  // Sync external value changes
  React.useEffect(() => {
    setSelectedDate(dateValue);
    if (dateValue) {
      const hours = String(dateValue.getHours()).padStart(2, "0");
      const minutes = String(dateValue.getMinutes()).padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [dateValue]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setOpen(false);

    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange?.(newDate);
    } else {
      onChange?.(date);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange?.(newDate);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2 flex-1">
        {showLabel && <Label className="px-1">{label || "Date"}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className="justify-between font-normal"
            >
              {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {showLabel && <Label className="px-1">Time</Label>}
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="bg-background"
        />
      </div>
    </div>
  );
}
