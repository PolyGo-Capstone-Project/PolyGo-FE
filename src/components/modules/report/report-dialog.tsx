"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@/components";
import { ReportEnum, ReportTypeEnum } from "@/constants";
import { useCreateReport, useUploadMultipleMediaMutation } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import type { CreateReportBodyType } from "@/models";
import {
  IconArrowLeft,
  IconLoader2,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportTypeEnum;
  targetId: string;
  onSuccess?: () => void;
};

const REASON_KEYS = {
  [ReportEnum.Event]: [
    "negative_content",
    "spam",
    "unreasonable_price",
    "violation",
    "other",
  ],
  [ReportEnum.Post]: [
    "negative_content",
    "spam",
    "misinformation",
    "copyright",
    "violation",
    "other",
  ],
  [ReportEnum.User]: [
    "impersonation",
    "spam",
    "negative_behavior",
    "violation",
    "other",
  ],
  [ReportEnum.System]: ["appeal", "bug", "support"],
} as const;

export function ReportDialog({
  open,
  onOpenChange,
  reportType,
  targetId,
  onSuccess,
}: ReportDialogProps) {
  const t = useTranslations("report");
  const tError = useTranslations("Error");
  const tSuccess = useTranslations("Success");

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createReportMutation = useCreateReport();
  const uploadMediaMutation = useUploadMultipleMediaMutation();

  const reasonKeys = REASON_KEYS[reportType] || [];
  const typeKey = reportType.toLowerCase();

  const handleClose = () => {
    setStep(1);
    setSelectedReason("");
    setDescription("");
    setSelectedImages([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (!selectedReason) {
      toast.error(
        t("dialog.step1.description", { type: t(`type.${reportType}`) })
      );
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
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

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error(
        t("dialog.step1.description", { type: t(`type.${reportType}`) })
      );
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
      const reasonText = t(`reasons.${typeKey}.${selectedReason}`);

      // Create report
      const body: CreateReportBodyType = {
        reportType,
        targetId,
        reason: reasonText,
        description: description.trim() || undefined,
        imageUrls: imageUrls,
      };

      await createReportMutation.mutateAsync(body);

      toast.success(t("success.submitted"));
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

  const isSubmitting =
    createReportMutation.isPending || uploadMediaMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("dialog.title", { type: t(`type.${reportType}`) })}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? t("dialog.step1.description", { type: t(`type.${reportType}`) })
              : t("dialog.step2.description")}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
            >
              <div className="space-y-3">
                {reasonKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReason(key)}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      {t(`reasons.${typeKey}.${key}`)}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("dialog.step2.descriptionLabel")}
              </Label>
              <Textarea
                id="description"
                placeholder={t("dialog.step2.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{t("dialog.step2.imagesLabel")}</Label>
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
                <div className="grid grid-cols-3 gap-3 mt-3">
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
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("dialog.step1.cancel")}
              </Button>
              <Button onClick={handleContinue} disabled={!selectedReason}>
                {t("dialog.step1.continue")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-2"
              >
                <IconArrowLeft className="h-4 w-4" />
                {t("dialog.step2.back")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("dialog.step2.submitting")}
                  </>
                ) : (
                  t("dialog.step2.submit")
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
