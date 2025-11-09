"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isFuture,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { useGetHostedEvents, useGetParticipatedEvents } from "@/hooks";
import { cn } from "@/lib/utils";

type MyEventCalendarProps = {
  activeTab: "all" | "created" | "joined";
};

export function MyEventCalendar({ activeTab }: MyEventCalendarProps) {
  const t = useTranslations("event.myEvent.calendar");
  const locale = useLocale();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch created events
  const {
    data: createdData,
    isLoading: isLoadingCreated,
    isError: isErrorCreated,
  } = useGetHostedEvents(
    {
      pageNumber: 1,
      pageSize: 100,
      lang: locale,
    },
    { enabled: activeTab === "created" }
  );

  // Fetch joined events
  const {
    data: joinedData,
    isLoading: isLoadingJoined,
    isError: isErrorJoined,
  } = useGetParticipatedEvents(
    {
      pageNumber: 1,
      pageSize: 100,
      lang: locale,
    },
    { enabled: activeTab === "all" || activeTab === "joined" }
  );

  // Get events based on active tab
  const events = useMemo(() => {
    const created = createdData?.payload?.data?.items || [];
    const joined = joinedData?.payload?.data?.items || [];

    if (activeTab === "created") return created;
    if (activeTab === "joined") return joined;

    // For "all" tab, merge and deduplicate by event ID
    const allEvents = [...created, ...joined];
    const uniqueEvents = allEvents.filter(
      (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );
    return uniqueEvents;
  }, [createdData, joinedData, activeTab]);

  const isLoading = isLoadingCreated || isLoadingJoined;
  const isError = isErrorCreated || isErrorJoined;

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startAt), day));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (eventId: string) => {
    setIsDialogOpen(false);
    router.push(`/${locale}/event/${eventId}`);
  };

  const handleShowMoreEvents = (day: Date) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const getEventColor = (event: any) => {
    const startDate = new Date(event.startAt);
    if (isToday(startDate))
      return "bg-blue-500 hover:bg-blue-600 border-blue-600";
    if (isFuture(startDate))
      return "bg-green-500 hover:bg-green-600 border-green-600";
    return "bg-gray-400 hover:bg-gray-500 border-gray-500";
  };

  const weekDays = [
    t("weekDays.sun"),
    t("weekDays.mon"),
    t("weekDays.tue"),
    t("weekDays.wed"),
    t("weekDays.thu"),
    t("weekDays.fri"),
    t("weekDays.sat"),
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-1 w-2" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-1 w-2" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Today Button */}
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="hidden sm:inline-flex"
              >
                {t("today")}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-[500px] w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t("loadError")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("loadErrorMessage")}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("retry")}
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr border-t overflow-auto">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={index}
                    className={cn(
                      "border-b border-r p-2 min-h-[80px] sm:min-h-[100px] overflow-hidden",
                      !isCurrentMonth && "bg-muted/20",
                      isDayToday && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                          isDayToday && "bg-blue-500 text-white",
                          !isCurrentMonth && "text-muted-foreground",
                          isCurrentMonth && !isDayToday && "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <TooltipProvider key={event.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleEventClick(event.id)}
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate transition-colors border",
                                  getEventColor(event)
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {format(new Date(event.startAt), "h:mm a")}{" "}
                                    - {event.title}
                                  </span>
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(event.startAt), "h:mm a")} •{" "}
                                  {event.expectedDurationInMinutes} {t("min")}
                                </p>
                                <p className="text-xs">
                                  {event.numberOfParticipants}/{event.capacity}{" "}
                                  {t("participants")}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}

                      {dayEvents.length > 3 && (
                        <button
                          className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => handleShowMoreEvents(day)}
                        >
                          +{dayEvents.length - 3} {t("moreEvents")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Today Button */}
            <div className="sm:hidden p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="w-full"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {t("goToToday")}
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t("noEventsYet")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "created"
                ? t("noEventsCreated")
                : activeTab === "joined"
                  ? t("noEventsJoined")
                  : t("noEventsAll")}
            </p>
            <Button onClick={() => router.push(`/${locale}/event`)}>
              {t("exploreEvents")}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Events Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && (
                <>
                  {t("eventsOn")} {format(selectedDay, "MMMM d, yyyy")}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md",
                  getEventColor(event)
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-lg">
                      {event.title}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">
                      {event.numberOfParticipants}/{event.capacity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.startAt), "h:mm a")}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {event.expectedDurationInMinutes} {t("min")}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-white/80 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
