"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components";
import { useWithdrawalConfirm } from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import {
  WithdrawalConfirmBodySchema,
  WithdrawalConfirmBodyType,
} from "@/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface WithdrawOTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WithdrawOTPDialog({
  open,
  onOpenChange,
  onSuccess,
}: WithdrawOTPDialogProps) {
  const t = useTranslations("wallet.withdraw.otp");
  const confirmMutation = useWithdrawalConfirm();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [otpString, setOtpString] = useState<string>("");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const form = useForm<WithdrawalConfirmBodyType>({
    resolver: zodResolver(WithdrawalConfirmBodySchema),
    defaultValues: {
      otp: "",
    },
  });

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeLeft(180);
      setOtpString("");
      form.reset();
    }
  }, [open, form]);

  // Countdown timer
  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showErrorToast("Timeout", tError);
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft, onOpenChange, t, tError]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and max 6 digits
    if (value === "" || (/^\d+$/.test(value) && value.length <= 6)) {
      setOtpString(value);
      form.setValue("otp", value, { shouldValidate: true });
    }
  };

  const handleSubmit = async (data: WithdrawalConfirmBodyType) => {
    try {
      const response = await confirmMutation.mutateAsync(data);
      showSuccessToast(response.payload?.message, tSuccess);
      onSuccess();
    } catch (error) {
      showErrorToast("InvalidOTP", tError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>{t("otpLabel")}</span>
                    <span
                      className={`text-sm font-mono ${
                        timeLeft <= 30
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otpString}
                      onChange={handleOtpChange}
                      disabled={confirmMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={confirmMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={confirmMutation.isPending}
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("confirming")}
                  </>
                ) : (
                  t("confirm")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
