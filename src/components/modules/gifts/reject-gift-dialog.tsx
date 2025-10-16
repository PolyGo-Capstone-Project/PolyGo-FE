"use client";

import { IconGift } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRejectGiftMutation } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import Image from "next/image";

type RejectGiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gift: any;
  locale: string;
};

export function RejectGiftDialog({
  open,
  onOpenChange,
  gift,
  locale,
}: RejectGiftDialogProps) {
  const t = useTranslations("gift.reject");
  const tToast = useTranslations("gift.toast");
  const tError = useTranslations("Error");

  // Reject mutation
  const rejectMutation = useRejectGiftMutation(
    { lang: locale },
    {
      onSuccess: () => {
        toast.success(tToast("rejectSuccess"));
        onOpenChange(false);
      },
    }
  );

  const handleReject = () => {
    rejectMutation.mutate(gift.presentationId, {
      onError: (error) => {
        handleErrorApi({ error, tError });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

        {/* Gift Preview */}
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {gift.giftIconUrl ? (
              <Image
                src={gift.giftIconUrl}
                alt={gift.giftName}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <IconGift className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{gift.giftName}</h4>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {!gift.isAnonymous && (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={gift.senderAvatarUrl || ""} />
                    <AvatarFallback className="text-xs">
                      {gift.senderName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {t("from")}: {gift.senderName}
                  </span>
                </>
              )}
              {gift.isAnonymous && <span>{t("from")}: Anonymous</span>}
            </div>
            <Badge variant="outline" className="mt-2">
              x{gift.quantity}
            </Badge>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={rejectMutation.isPending}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
