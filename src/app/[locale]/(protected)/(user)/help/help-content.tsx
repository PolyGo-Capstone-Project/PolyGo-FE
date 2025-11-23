"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
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
  Textarea,
} from "@/components";
import { ReportDetailDialog } from "@/components/modules/report";
import { ReportStatusEnum } from "@/constants";
import {
  useCreateReport,
  useGetUserReports,
  useUploadMultipleMediaMutation,
} from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import type { CreateReportBodyType } from "@/models";
import {
  IconEye,
  IconLoader2,
  IconPhoto,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function HelpContent() {
  const t = useTranslations("report");
  const tError = useTranslations("Error");

  const [activeTab, setActiveTab] = useState<string>("system");
  const [page, setPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // System report form state
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const createReportMutation = useCreateReport();
  const uploadMediaMutation = useUploadMultipleMediaMutation();

  // Fetch user reports
  const { data: userReportsData, refetch } = useGetUserReports({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const reports = userReportsData?.data?.items || [];
  const totalPages = userReportsData?.data?.totalPages || 1;

  const getReason = (report: any) => {
    return report.reason || "N/A";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error(t("error.invalidImages"));
      return;
    }

    // Limit to 5 images total
    const remainingSlots = 5 - selectedImages.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.error(t("error.maxImages", { max: 5 }));
    }

    // Create preview URLs
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...filesToAdd]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitSystemReport = async () => {
    if (!selectedReason) {
      toast.error(t("dialog.step1.description", { type: t("type.System") }));
      return;
    }

    try {
      let imageUrls: string[] = [];

      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadResult = await uploadMediaMutation.mutateAsync({
          files: selectedImages,
          addUniqueName: true,
        });

        if (uploadResult.payload?.data) {
          imageUrls = uploadResult.payload.data;
        }
      }

      // Get the full reason text from translation
      const reasonText = t(`reasons.system.${selectedReason}`);

      // Create report
      const body: CreateReportBodyType = {
        reportType: "System",
        targetId: "system",
        reason: reasonText,
        description: description.trim() || undefined,
        imageUrls: imageUrls,
      };

      await createReportMutation.mutateAsync(body);

      toast.success(t("success.submitted"));

      // Reset form
      setSelectedReason("");
      setDescription("");
      setSelectedImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      // Switch to my reports tab and refetch
      setActiveTab("myReports");
      refetch();
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

  const isSubmitting =
    createReportMutation.isPending || uploadMediaMutation.isPending;

  return (
    <>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">{t("help.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("help.description")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="system">
              {t("help.systemReport.title")}
            </TabsTrigger>
            <TabsTrigger value="myReports">
              {t("help.myReports.title")}
            </TabsTrigger>
          </TabsList>

          {/* System Report Tab */}
          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("help.systemReport.title")}</CardTitle>
                <CardDescription>
                  {t("help.systemReport.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reason Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    {t("dialog.step1.title")}
                  </Label>
                  <RadioGroup
                    value={selectedReason}
                    onValueChange={setSelectedReason}
                    disabled={isSubmitting}
                  >
                    <div className="grid gap-3">
                      {["appeal", "bug", "support"].map((reasonKey) => (
                        <div
                          key={reasonKey}
                          className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() =>
                            !isSubmitting && setSelectedReason(reasonKey)
                          }
                        >
                          <RadioGroupItem value={reasonKey} id={reasonKey} />
                          <Label
                            htmlFor={reasonKey}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            {t(`reasons.system.${reasonKey}`)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="system-description"
                    className="text-base font-semibold"
                  >
                    {t("dialog.step2.descriptionLabel")}
                  </Label>
                  <Textarea
                    id="system-description"
                    placeholder={t("dialog.step2.descriptionPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {t("dialog.step2.imagesLabel")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || selectedImages.length >= 5}
                      className="gap-2"
                    >
                      <IconPhoto className="h-4 w-4" />
                      {t("dialog.step2.uploadButton")}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {t("dialog.step2.maxImages", { max: 5 })} (
                      {selectedImages.length}/5)
                    </span>
                  </div>

                  {/* Image Previews */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-3">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square group rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                            type="button"
                            disabled={isSubmitting}
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    onClick={handleSubmitSystemReport}
                    disabled={!selectedReason || isSubmitting}
                    className="gap-2 min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="h-5 w-5 animate-spin" />
                        {t("dialog.step2.submitting")}
                      </>
                    ) : (
                      <>
                        <IconSend className="h-5 w-5" />
                        {t("dialog.step2.submit")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="myReports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("help.myReports.title")}</CardTitle>
                <CardDescription>
                  {t("help.myReports.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("user.table.type")}</TableHead>
                          <TableHead>{t("user.table.reason")}</TableHead>
                          <TableHead>{t("user.table.status")}</TableHead>
                          <TableHead>{t("user.table.createdAt")}</TableHead>
                          <TableHead className="text-right">
                            {t("user.table.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-muted-foreground">
                                  {t("user.noReports")}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveTab("system")}
                                >
                                  {t("user.createReport")}
                                </Button>
                              </div>
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
                                <span className="text-sm max-w-[300px] truncate block">
                                  {getReason(report)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    report.status === ReportStatusEnum.Resolved
                                      ? "default"
                                      : report.status ===
                                          ReportStatusEnum.Rejected
                                        ? "destructive"
                                        : report.status ===
                                            ReportStatusEnum.Processing
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
                                  {t("user.viewReport")}
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
                        {t("user.pagination.page", {
                          current: page,
                          total: totalPages,
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                        >
                          {t("user.pagination.previous")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                        >
                          {t("user.pagination.next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
              refetch();
            }
          }}
          reportId={selectedReportId}
          isAdmin={false}
        />
      )}
    </>
  );
}
