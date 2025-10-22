"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@/components/ui";
import { useUpdateAutoRenewMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";

type AutoRenewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAutoRenew: boolean;
};

export function AutoRenewDialog({
  open,
  onOpenChange,
  currentAutoRenew,
}: AutoRenewDialogProps) {
  const isEnabling = !currentAutoRenew;
  const tKey = isEnabling ? "enable" : "disable";

  const t = useTranslations(`wallet.autoRenew.${tKey}`);
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();

  const updateAutoRenewMutation = useUpdateAutoRenewMutation({ lang: locale });

  const handleConfirm = async () => {
    try {
      const result = await updateAutoRenewMutation.mutateAsync({
        autoRenew: !currentAutoRenew,
      });

      showSuccessToast(result.payload?.message, tSuccess);
      onOpenChange(false);
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

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateAutoRenewMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={updateAutoRenewMutation.isPending}
          >
            {updateAutoRenewMutation.isPending ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Processing...
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
