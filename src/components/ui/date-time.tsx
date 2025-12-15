"use client";

import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { ChevronDownIcon, ClockIcon } from "lucide-react";
import * as React from "react";

interface DateTimePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  label?: string;
  showLabel?: boolean;
}

// Generate hours (00-23)
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

// Generate minutes (00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
const minutes = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  disabled = false,
  disabledDates,
  label,
  showLabel = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);

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

  const [selectedHour, setSelectedHour] = React.useState<string>(() => {
    if (dateValue) {
      return String(dateValue.getHours()).padStart(2, "0");
    }
    return "10";
  });

  const [selectedMinute, setSelectedMinute] = React.useState<string>(() => {
    if (dateValue) {
      return String(dateValue.getMinutes()).padStart(2, "0");
    }
    return "00";
  });

  // Sync external value changes
  React.useEffect(() => {
    setSelectedDate(dateValue);
    if (dateValue) {
      setSelectedHour(String(dateValue.getHours()).padStart(2, "0"));
      setSelectedMinute(String(dateValue.getMinutes()).padStart(2, "0"));
    }
  }, [dateValue]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setOpen(false);

    if (date) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
      onChange?.(newDate);
    } else {
      onChange?.(date);
    }
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);

    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
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
              disabled={disabledDates || disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {showLabel && <Label className="px-1">Time</Label>}
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className="justify-between font-normal"
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {selectedHour}:{selectedMinute}
                </span>
              </div>
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex gap-2 items-center">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Hour</Label>
                <Select
                  value={selectedHour}
                  onValueChange={(hour) =>
                    handleTimeChange(hour, selectedMinute)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-2xl font-bold mt-6">:</span>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Minute</Label>
                <Select
                  value={selectedMinute}
                  onValueChange={(minute) =>
                    handleTimeChange(selectedHour, minute)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
