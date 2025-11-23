"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import { ReportDetailDialog } from "@/components/modules/report";
import type { ReportStatusTypeEnum, ReportTypeEnum } from "@/constants";
import { ReportEnum, ReportStatusEnum } from "@/constants";
import { useGetAllReports } from "@/hooks";
import { IconEye, IconRefresh } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

const PAGE_SIZE = 10;

export default function ReportContent() {
  const t = useTranslations("report");

  // State for all tabs
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // All Reports Tab
  const [allPage, setAllPage] = useState(1);
  const [allStatusFilter, setAllStatusFilter] = useState<
    ReportStatusTypeEnum | "all"
  >("all");
  const [allTypeFilter, setAllTypeFilter] = useState<ReportTypeEnum | "all">(
    "all"
  );

  // Pending Tab
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTypeFilter, setPendingTypeFilter] = useState<
    ReportTypeEnum | "all"
  >("all");

  // In Processing Tab
  const [processingPage, setProcessingPage] = useState(1);
  const [processingTypeFilter, setProcessingTypeFilter] = useState<
    ReportTypeEnum | "all"
  >("all");

  // Resolved Tab
  const [resolvedPage, setResolvedPage] = useState(1);
  const [resolvedTypeFilter, setResolvedTypeFilter] = useState<
    ReportTypeEnum | "all"
  >("all");

  // Rejected Tab
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedTypeFilter, setRejectedTypeFilter] = useState<
    ReportTypeEnum | "all"
  >("all");

  // Fetch data for each tab
  const { data: allReportsData, refetch: refetchAll } = useGetAllReports({
    pageNumber: allPage,
    pageSize: PAGE_SIZE,
    status: allStatusFilter === "all" ? undefined : allStatusFilter,
    reportType: allTypeFilter === "all" ? undefined : allTypeFilter,
  });

  const { data: pendingReportsData, refetch: refetchPending } =
    useGetAllReports({
      pageNumber: pendingPage,
      pageSize: PAGE_SIZE,
      status: ReportStatusEnum.Pending,
      reportType: pendingTypeFilter === "all" ? undefined : pendingTypeFilter,
    });

  const { data: processingReportsData, refetch: refetchProcessing } =
    useGetAllReports({
      pageNumber: processingPage,
      pageSize: PAGE_SIZE,
      status: ReportStatusEnum.Processing,
      reportType:
        processingTypeFilter === "all" ? undefined : processingTypeFilter,
    });

  const { data: resolvedReportsData, refetch: refetchResolved } =
    useGetAllReports({
      pageNumber: resolvedPage,
      pageSize: PAGE_SIZE,
      status: ReportStatusEnum.Resolved,
      reportType: resolvedTypeFilter === "all" ? undefined : resolvedTypeFilter,
    });

  const { data: rejectedReportsData, refetch: refetchRejected } =
    useGetAllReports({
      pageNumber: rejectedPage,
      pageSize: PAGE_SIZE,
      status: ReportStatusEnum.Rejected,
      reportType: rejectedTypeFilter === "all" ? undefined : rejectedTypeFilter,
    });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTargetName = (report: any) => {
    if (!report.targetInfo) {
      return report.reportType === ReportEnum.System ? t("type.System") : "N/A";
    }

    const targetInfo = report.targetInfo;

    // User
    if ("mail" in targetInfo) {
      return targetInfo.name;
    }

    // Event
    if ("title" in targetInfo && "status" in targetInfo) {
      return targetInfo.title;
    }

    // Post
    if ("content" in targetInfo) {
      return targetInfo.content.substring(0, 50) + "...";
    }

    return "N/A";
  };

  const renderReportsTable = (
    data: any,
    page: number,
    setPage: (page: number) => void,
    typeFilter: ReportTypeEnum | "all",
    setTypeFilter: (type: ReportTypeEnum | "all") => void,
    refetch: () => void,
    showStatusFilter: boolean = false,
    statusFilter?: ReportStatusTypeEnum | "all",
    setStatusFilter?: (status: ReportStatusTypeEnum | "all") => void
  ) => {
    const reports = data?.data?.items || [];
    const totalPages = data?.data?.totalPages || 1;

    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("admin.filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.filters.all")}</SelectItem>
                {Object.values(ReportEnum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showStatusFilter && setStatusFilter && (
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("admin.filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.filters.all")}</SelectItem>
                  {Object.values(ReportStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" size="sm" onClick={refetch}>
              <IconRefresh className="h-4 w-4 mr-2" />
              {t("admin.filters.refresh")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.table.type")}</TableHead>
                <TableHead>{t("admin.table.reporter")}</TableHead>
                <TableHead>{t("admin.table.target")}</TableHead>
                <TableHead>{t("admin.table.reason")}</TableHead>
                <TableHead>{t("admin.table.status")}</TableHead>
                <TableHead>{t("admin.table.createdAt")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {t("admin.table.noReports")}
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`type.${report.reportType}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.reporter.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(report.reporter.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reporter.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[200px] truncate block">
                        {getTargetName(report)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] truncate block">
                        {report.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === ReportStatusEnum.Resolved
                            ? "default"
                            : report.status === ReportStatusEnum.Rejected
                              ? "destructive"
                              : report.status === ReportStatusEnum.Processing
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {t(`status.${report.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(report.createdAt), "PPp")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        <IconEye className="h-4 w-4 mr-1" />
                        {t("admin.table.viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review all reports submitted by users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">{t("admin.tabs.all")}</TabsTrigger>
            <TabsTrigger value="pending">{t("admin.tabs.pending")}</TabsTrigger>
            <TabsTrigger value="processing">
              {t("admin.tabs.processing")}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              {t("admin.tabs.resolved")}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("admin.tabs.rejected")}
            </TabsTrigger>
          </TabsList>

          {/* All Reports Tab */}
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tabs.all")}</CardTitle>
                <CardDescription>
                  View all reports in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsTable(
                  allReportsData,
                  allPage,
                  setAllPage,
                  allTypeFilter,
                  setAllTypeFilter,
                  refetchAll,
                  true,
                  allStatusFilter,
                  setAllStatusFilter
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tabs.pending")}</CardTitle>
                <CardDescription>
                  Reports waiting to be reviewed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsTable(
                  pendingReportsData,
                  pendingPage,
                  setPendingPage,
                  pendingTypeFilter,
                  setPendingTypeFilter,
                  refetchPending
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* In Processing Tab */}
          <TabsContent value="processing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tabs.processing")}</CardTitle>
                <CardDescription>
                  Reports currently being processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsTable(
                  processingReportsData,
                  processingPage,
                  setProcessingPage,
                  processingTypeFilter,
                  setProcessingTypeFilter,
                  refetchProcessing
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolved Tab */}
          <TabsContent value="resolved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tabs.resolved")}</CardTitle>
                <CardDescription>
                  Reports that have been resolved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsTable(
                  resolvedReportsData,
                  resolvedPage,
                  setResolvedPage,
                  resolvedTypeFilter,
                  setResolvedTypeFilter,
                  refetchResolved
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tabs.rejected")}</CardTitle>
                <CardDescription>
                  Reports that have been rejected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderReportsTable(
                  rejectedReportsData,
                  rejectedPage,
                  setRejectedPage,
                  rejectedTypeFilter,
                  setRejectedTypeFilter,
                  refetchRejected
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Detail Dialog */}
      {selectedReportId && (
        <ReportDetailDialog
          open={!!selectedReportId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedReportId(null);
              // Refetch current tab
              if (activeTab === "all") refetchAll();
              else if (activeTab === "pending") refetchPending();
              else if (activeTab === "processing") refetchProcessing();
              else if (activeTab === "resolved") refetchResolved();
              else if (activeTab === "rejected") refetchRejected();
            }
          }}
          reportId={selectedReportId}
          isAdmin={true}
        />
      )}
    </>
  );
}
