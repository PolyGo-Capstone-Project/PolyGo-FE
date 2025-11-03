"use client";

import { format, isSameDay } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@/components/ui";
import { useGetHostedEvents, useGetParticipatedEvents } from "@/hooks";

import "react-day-picker/dist/style.css";

type MyEventCalendarProps = {
  activeTab: "all" | "created" | "joined";
};

export function MyEventCalendar({ activeTab }: MyEventCalendarProps) {
  const t = useTranslations("event.myEvent.calendar");
  const locale = useLocale();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [month, setMonth] = useState<Date>(new Date());

  // Fetch created events
  const { data: createdData } = useGetHostedEvents(
    {
      pageNumber: 1,
      pageSize: 100,
      lang: locale,
    },
    { enabled: activeTab === "all" || activeTab === "created" }
  );

  // Fetch joined events
  const { data: joinedData } = useGetParticipatedEvents(
    {
      pageNumber: 1,
      pageSize: 100,
      lang: locale,
    },
    { enabled: activeTab === "all" || activeTab === "joined" }
  );

  // Get events based on active tab
  const getEvents = () => {
    const created = createdData?.payload?.data?.items || [];
    const joined = joinedData?.payload?.data?.items || [];

    if (activeTab === "created") return created;
    if (activeTab === "joined") return joined;
    return [...created, ...joined];
  };

  const events = getEvents();

  // Get dates that have events
  const eventDates = events.map((event) => new Date(event.startAt));

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? events.filter((event) => isSameDay(new Date(event.startAt), selectedDate))
    : [];

  const handleEventClick = (eventId: string) => {
    router.push(`/${locale}/event/${eventId}`);
  };

  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersClassNames = {
    hasEvent: "has-event",
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <style jsx global>{`
          .rdp {
            --rdp-cell-size: 50px;
            --rdp-accent-color: hsl(var(--primary));
            --rdp-background-color: hsl(var(--primary) / 0.1);
            margin: 0;
          }

          .rdp-months {
            justify-content: center;
          }

          .rdp-month {
            width: 100%;
          }

          .rdp-table {
            width: 100%;
            max-width: none;
          }

          .rdp-cell {
            padding: 4px;
          }

          .rdp-day {
            width: 100%;
            height: 48px;
            font-size: 14px;
            border-radius: 8px;
          }

          .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
            background-color: hsl(var(--accent));
          }

          .rdp-day_selected {
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            font-weight: 600;
          }

          .rdp-day.has-event {
            position: relative;
            font-weight: 600;
          }

          .rdp-day.has-event::after {
            content: "";
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background-color: hsl(var(--primary));
            border-radius: 50%;
          }

          .rdp-day_selected.has-event::after {
            background-color: hsl(var(--primary-foreground));
          }

          .rdp-caption {
            display: flex;
            justify-content: center;
            padding: 1rem;
            font-weight: 600;
            font-size: 16px;
          }

          .rdp-nav {
            display: flex;
            gap: 4px;
          }

          .rdp-nav_button {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
          }

          .rdp-nav_button:hover:not([disabled]) {
            background-color: hsl(var(--accent));
          }

          .rdp-head_cell {
            font-weight: 600;
            font-size: 12px;
            color: hsl(var(--muted-foreground));
            text-transform: uppercase;
          }

          @media (max-width: 640px) {
            .rdp {
              --rdp-cell-size: 40px;
            }
            .rdp-day {
              height: 40px;
              font-size: 12px;
            }
          }
        `}</style>

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="mx-auto"
          showOutsideDays={false}
        />

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {format(selectedDate, "MMMM dd, yyyy")}
            </h3>
            {selectedDateEvents.length > 0 ? (
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <Popover key={event.id}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.startAt), "h:mm a")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {event.numberOfParticipants}/{event.capacity}
                          </Badge>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Time:</span>{" "}
                              {format(new Date(event.startAt), "h:mm a")}
                            </p>
                            <p>
                              <span className="font-medium">Duration:</span>{" "}
                              {event.expectedDurationInMinutes} minutes
                            </p>
                            <p>
                              <span className="font-medium">Participants:</span>{" "}
                              {event.numberOfParticipants}/{event.capacity}
                            </p>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleEventClick(event.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("noEvents")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
