"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@/components/ui";
import { useCancelSubscriptionMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";

type CancelSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CANCEL_REASONS = [
  "tooExpensive",
  "notUsingEnough",
  "foundAlternative",
  "technicalIssues",
  "lackOfFeatures",
  "other",
] as const;

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
}: CancelSubscriptionDialogProps) {
  const t = useTranslations("wallet.cancelSubscription");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState("");

  const cancelMutation = useCancelSubscriptionMutation({ lang: locale });

  const handleCancel = async () => {
    if (!selectedReason) return;

    const reason =
      selectedReason === "other" ? otherReason : t(`reasons.${selectedReason}`);

    if (selectedReason === "other" && !otherReason.trim()) {
      return;
    }

    try {
      const result = await cancelMutation.mutateAsync({ reason });
      showSuccessToast(result.payload?.message, tSuccess);
      onOpenChange(false);

      // Reset form
      setSelectedReason("");
      setOtherReason("");
    } catch (error: any) {
      handleErrorApi({
        error,
        tError,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            <div className="space-y-3">
              {CANCEL_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label
                    htmlFor={reason}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(`reasons.${reason}`)}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Other reason textarea */}
          {selectedReason === "other" && (
            <Textarea
              placeholder={t("otherReasonPlaceholder")}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={
              !selectedReason ||
              (selectedReason === "other" && !otherReason.trim()) ||
              cancelMutation.isPending
            }
          >
            {cancelMutation.isPending ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("confirm")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
