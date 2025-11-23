"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  MarkdownRenderer,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "@/components";
import {
  ReportEnum,
  ReportStatusEnum,
  ReportStatusTypeEnum,
} from "@/constants";
import { useGetReportById, useProcessReport } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import type { ProcessReportBodyType } from "@/models";
import { IconLoader2, IconUser } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ReportDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  isAdmin?: boolean;
};

export function ReportDetailDialog({
  open,
  onOpenChange,
  reportId,
  isAdmin = false,
}: ReportDetailDialogProps) {
  const t = useTranslations("report");
  const tError = useTranslations("Error");

  const [status, setStatus] = useState<ReportStatusTypeEnum>(
    ReportStatusEnum.Pending
  );
  const [adminResponse, setAdminResponse] = useState("");
  const [adminResponseToTarget, setAdminResponseToTarget] = useState("");

  const { data, isLoading } = useGetReportById(reportId, { enabled: open });
  const processReportMutation = useProcessReport();

  const report = data?.data;

  useEffect(() => {
    if (report) {
      setStatus(report.status);
      setAdminResponse(report.adminResponse || "");
      setAdminResponseToTarget(report.adminResponseToTarget || "");
    }
  }, [report]);

  const handleUpdateReport = async () => {
    if (!report) return;

    try {
      const body: ProcessReportBodyType = {
        status,
        adminResponse: adminResponse.trim() || undefined,
        adminResponseToTarget: adminResponseToTarget.trim() || undefined,
      };

      await processReportMutation.mutateAsync({
        reportId: report.id,
        body,
      });

      toast.success(t("success.updated"));
      onOpenChange(false);
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTargetInfo = () => {
    if (!report?.targetInfo) {
      return (
        <div className="text-sm text-muted-foreground">
          {report?.reportType === ReportEnum.System
            ? t("admin.detail.targetInfo") + ": " + t("type.System")
            : "N/A"}
        </div>
      );
    }

    const targetInfo = report.targetInfo;

    // Check if it's a User
    if ("mail" in targetInfo) {
      return (
        <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
          <p className="font-semibold text-sm">
            {t("admin.detail.targetUser")}
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={targetInfo.avatarUrl} />
              <AvatarFallback>
                <IconUser className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{targetInfo.name}</p>
              <p className="text-sm text-muted-foreground">{targetInfo.mail}</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if it's an Event
    if ("title" in targetInfo && "status" in targetInfo) {
      return (
        <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
          <p className="font-semibold text-sm">
            {t("admin.detail.targetEvent")}
          </p>
          <div className="space-y-2">
            <p className="font-medium">{targetInfo.title}</p>
            {targetInfo.description && (
              <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={targetInfo.description} />
              </div>
            )}
            {targetInfo.status && (
              <Badge variant="outline">{targetInfo.status}</Badge>
            )}
          </div>
        </div>
      );
    }

    // Check if it's a Post
    if ("content" in targetInfo) {
      return (
        <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
          <p className="font-semibold text-sm">
            {t("admin.detail.targetPost")}
          </p>
          {targetInfo.creator && (
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={targetInfo.creator.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(targetInfo.creator.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{targetInfo.creator.name}</p>
                <p className="text-xs text-muted-foreground">
                  {targetInfo.creator.mail}
                </p>
              </div>
            </div>
          )}
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={targetInfo.content} />
          </div>
        </div>
      );
    }

    return <div className="text-sm text-muted-foreground">N/A</div>;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.detail.title")}</DialogTitle>
          <DialogDescription>
            {t(`type.${report.reportType}`)} - {report.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">
              {t("admin.detail.reportInfo")}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.reportType")}
                </Label>
                <p className="text-sm font-medium mt-1">
                  {t(`type.${report.reportType}`)}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.reportStatus")}
                </Label>
                <div className="mt-1">
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
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.reporter")}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={report.reporter.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {getInitials(report.reporter.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {report.reporter.name}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.reportedAt")}
                </Label>
                <p className="text-sm mt-1">
                  {format(new Date(report.createdAt), "PPp")}
                </p>
              </div>

              {report.processedBy && (
                <>
                  <div>
                    <Label className="text-muted-foreground">
                      {t("admin.detail.processedBy")}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={report.processedBy.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(report.processedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {report.processedBy.name}
                      </span>
                    </div>
                  </div>

                  {report.processedAt && (
                    <div>
                      <Label className="text-muted-foreground">
                        {t("admin.detail.processedAt")}
                      </Label>
                      <p className="text-sm mt-1">
                        {format(new Date(report.processedAt), "PPp")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Reason & Description */}
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">
                {t("admin.detail.reason")}
              </Label>
              <p className="text-sm mt-1">{report.reason}</p>
            </div>

            {report.description && (
              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.description")}
                </Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            )}

            {report.imageUrls && report.imageUrls.length > 0 && (
              <div>
                <Label className="text-muted-foreground">
                  {t("admin.detail.images")}
                </Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {report.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Target Info */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">
              {t("admin.detail.targetInfo")}
            </Label>
            {renderTargetInfo()}
          </div>

          {/* Admin Actions - Only for admin */}
          {isAdmin && (
            <>
              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">
                    {t("admin.detail.updateStatus")}
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ReportStatusTypeEnum)}
                  >
                    <SelectTrigger id="status" className="my-2 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ReportStatusEnum).map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="adminResponse">
                    {t("admin.detail.adminResponse")}
                  </Label>
                  <Textarea
                    id="adminResponse"
                    placeholder={t("admin.detail.adminResponsePlaceholder")}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="adminResponseToTarget">
                    {t("admin.detail.adminResponseToTarget")}
                  </Label>
                  <Textarea
                    id="adminResponseToTarget"
                    placeholder={t(
                      "admin.detail.adminResponseToTargetPlaceholder"
                    )}
                    value={adminResponseToTarget}
                    onChange={(e) => setAdminResponseToTarget(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Display Admin Responses for non-admin */}
          {!isAdmin &&
            (report.adminResponse || report.adminResponseToTarget) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {report.adminResponse && (
                    <div>
                      <Label className="text-muted-foreground">
                        {t("admin.detail.adminResponse")}
                      </Label>
                      <p className="text-sm mt-1 p-3 bg-accent/30 rounded-lg whitespace-pre-wrap">
                        {report.adminResponse}
                      </p>
                    </div>
                  )}

                  {report.adminResponseToTarget && (
                    <div>
                      <Label className="text-muted-foreground">
                        {t("admin.detail.adminResponseToTarget")}
                      </Label>
                      <p className="text-sm mt-1 p-3 bg-accent/30 rounded-lg whitespace-pre-wrap">
                        {report.adminResponseToTarget}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
        </div>

        <DialogFooter>
          {isAdmin ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processReportMutation.isPending}
              >
                {t("admin.detail.close")}
              </Button>
              <Button
                onClick={handleUpdateReport}
                disabled={processReportMutation.isPending}
              >
                {processReportMutation.isPending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("admin.detail.processing")}
                  </>
                ) : (
                  t("admin.detail.updateStatus")
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.detail.close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
