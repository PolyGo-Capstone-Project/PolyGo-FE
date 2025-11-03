"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTimePicker,
  EventStats,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { UpdateStatusDialog } from "@/components/modules/admin/events/update-status-dialog";
import { Pagination } from "@/components/shared";
import { EventStatus } from "@/constants";
import {
  useGetPastEvents,
  useGetUpcomingEvents,
} from "@/hooks/query/use-event";
import { useLanguagesQuery } from "@/hooks/query/use-language";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SearchEventsQueryType } from "@/models";
import {
  IconFilter,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type TabType = "upcoming" | "past";

export default function ManageEvents() {
  const t = useTranslations("admin.events");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedFee, setSelectedFee] = useState<"Free" | "Paid" | "">("");
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch languages
  const { data: languagesData } = useLanguagesQuery({
    params: { lang: locale },
  });
  const languages = languagesData?.payload?.data?.items ?? [];

  // Build query
  const query: SearchEventsQueryType = useMemo(() => {
    const baseQuery: SearchEventsQueryType = {
      pageNumber: page,
      pageSize,
      lang: locale,
    };

    if (searchTerm.trim()) {
      baseQuery.name = searchTerm.trim();
    }
    if (selectedLanguage) {
      baseQuery.languageIds = selectedLanguage;
    }
    if (selectedFee) {
      baseQuery.isFree = selectedFee === "Free" ? true : false;
    }
    if (selectedTime) {
      baseQuery.time = selectedTime.toISOString();
    }

    return baseQuery;
  }, [
    page,
    pageSize,
    locale,
    searchTerm,
    selectedLanguage,
    selectedFee,
    selectedTime,
  ]);

  // Queries
  const upcomingQuery = useGetUpcomingEvents(query, {
    enabled: activeTab === "upcoming",
  });

  const pastQuery = useGetPastEvents(query, {
    enabled: activeTab === "past",
  });

  const activeQuery = activeTab === "upcoming" ? upcomingQuery : pastQuery;

  const events = activeQuery.data?.payload?.data?.items ?? [];
  const totalPages = activeQuery.data?.payload?.data?.totalPages ?? 1;
  const totalItems = activeQuery.data?.payload?.data?.totalItems ?? 0;

  // Reset page when changing tabs or filters
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm, selectedLanguage, selectedFee, selectedTime]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedLanguage("");
    setSelectedFee("");
    setSelectedTime(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedLanguage || selectedFee || selectedTime;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case EventStatus.Approved:
        return "default";
      case EventStatus.Pending:
        return "secondary";
      case EventStatus.Rejected:
        return "destructive";
      case EventStatus.Live:
        return "default";
      case EventStatus.Cancelled:
        return "outline";
      case EventStatus.Completed:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <Button
          variant={activeTab === "upcoming" ? "default" : "ghost"}
          onClick={() => setActiveTab("upcoming")}
          className="rounded-b-none whitespace-nowrap"
        >
          {t("upcomingTab")}
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "ghost"}
          onClick={() => setActiveTab("past")}
          className="rounded-b-none whitespace-nowrap"
        >
          {t("pastTab")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("tableTitle")}</CardTitle>
              <CardDescription>{t("tableDescription")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeQuery.refetch()}
                disabled={activeQuery.isLoading}
              >
                <IconRefresh
                  className={`mr-2 size-4 ${activeQuery.isLoading ? "animate-spin" : ""}`}
                />
                {t("refresh")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("filters.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconFilter className="mr-2 size-4" />
                  {t("filters.title")}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {
                        [selectedLanguage, selectedFee, selectedTime].filter(
                          Boolean
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="p-4">
                <SheetHeader>
                  <SheetTitle>{t("filters.title")}</SheetTitle>
                  <SheetDescription>
                    {t("filters.description")}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Language Filter */}
                    <div className="space-y-2">
                      <Label>{t("filters.language")}</Label>
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("filters.allLanguages")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("filters.allLanguages")}
                          </SelectItem>
                          {languages.map((language) => (
                            <SelectItem key={language.id} value={language.id}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fee Filter */}
                    <div className="space-y-2">
                      <Label>{t("filters.fee")}</Label>
                      <Select
                        value={selectedFee || "all"}
                        onValueChange={(value) =>
                          setSelectedFee(
                            value === "all" ? "" : (value as "Free" | "Paid")
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("filters.allFees")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("filters.allFees")}
                          </SelectItem>
                          <SelectItem value="Free">
                            {t("filters.free")}
                          </SelectItem>
                          <SelectItem value="Paid">
                            {t("filters.paid")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div className="space-y-2">
                    <Label>{t("filters.time")}</Label>
                    <DateTimePicker
                      value={selectedTime}
                      onChange={setSelectedTime}
                      placeholder={t("filters.selectDateTime")}
                    />
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                    >
                      <IconX className="mr-2 size-4" />
                      {t("filters.clearFilters")}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      {t("filters.apply")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Table */}
          {activeQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("errorTitle")}</h3>
                <p className="mt-2 text-muted-foreground">{t("error")}</p>
                <Button className="mt-4" onClick={() => activeQuery.refetch()}>
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
                <p className="mt-2 text-muted-foreground">
                  {t("emptyDescription")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{t("columns.no")}</TableHead>
                      <TableHead className="min-w-[200px]">
                        {t("columns.title")}
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        {t("columns.host")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {t("columns.language")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {t("columns.status")}
                      </TableHead>
                      <TableHead className="min-w-[150px]">
                        {t("columns.startAt")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {t("columns.capacity")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {t("columns.fee")}
                      </TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        {t("columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {(page - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>{event.host.name}</TableCell>
                        <TableCell>{event.language.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {t(`status.${event.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(event.startAt, locale)}
                        </TableCell>
                        <TableCell>
                          {event.numberOfParticipants} / {event.capacity}
                        </TableCell>
                        <TableCell>
                          {event.fee === 0
                            ? t("filters.free")
                            : formatCurrency(event.fee)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <EventStats eventId={event.id} />
                            {activeTab === "upcoming" && (
                              <UpdateStatusDialog eventId={event.id} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  hasNextPage={page < totalPages}
                  hasPreviousPage={page > 1}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
