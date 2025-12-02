"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components";
import { useDepositUrl } from "@/hooks";
import { formatCurrency, getPaymentUrls, showErrorToast } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const t = useTranslations("wallet.deposit");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const [amount, setAmount] = useState<string>("");

  const { mutate: depositUrl, isPending } = useDepositUrl();

  const handleDeposit = () => {
    const numAmount = Number(amount);

    // Validation
    if (!amount || isNaN(numAmount)) {
      toast.error(t("validation.required"));
      return;
    }

    if (numAmount < 10000) {
      toast.error(t("validation.min"));
      return;
    }

    const { returnUrl, cancelUrl } = getPaymentUrls(locale);

    depositUrl(
      {
        amount: numAmount,
        returnUrl,
        cancelUrl,
      },
      {
        onSuccess: (response) => {
          const depositUrlData = response?.payload?.data?.depositUrl;
          if (depositUrlData) {
            // Redirect to payment gateway
            window.location.href = depositUrlData;
          } else {
            showErrorToast("depositError", tError);
          }
        },
        onError: () => {
          showErrorToast("depositError", tError);
        },
      }
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">{t("amountLabel")}</Label>
            <Input
              id="amount"
              type="text"
              placeholder={t("amountPlaceholder")}
              value={amount}
              onChange={handleAmountChange}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">{t("amountHint")}</p>
            {amount && !isNaN(Number(amount)) && (
              <p className="text-sm font-medium">
                {formatCurrency(Number(amount), locale)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleDeposit} disabled={isPending}>
            {isPending ? t("processing") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
