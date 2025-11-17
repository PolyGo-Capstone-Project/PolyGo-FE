"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { WithdrawForm } from "@/components/modules/wallet/withdraw-form";
import { WithdrawOTPDialog } from "@/components/modules/wallet/withdraw-otp-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeOfVerificationCode } from "@/constants";
import { useAuthMe, useSendOTPMutation, useUserWallet } from "@/hooks";
import { WithdrawalRequestBodyType } from "@/models";
import { toast } from "sonner";

export default function WithdrawPage() {
  const t = useTranslations("wallet.withdraw");
  const router = useRouter();
  const [withdrawData, setWithdrawData] =
    useState<WithdrawalRequestBodyType | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const { data: authData } = useAuthMe();
  const { data: walletData } = useUserWallet();
  const sendOTPMutation = useSendOTPMutation();

  const user = authData?.payload.data;
  const wallet = walletData?.payload.data;

  const handleWithdrawSubmit = async (data: WithdrawalRequestBodyType) => {
    try {
      // Send OTP first
      await sendOTPMutation.mutateAsync({
        mail: user?.mail ?? "",
        verificationType: TypeOfVerificationCode.Withdraw_money,
      });
      setWithdrawData(data);
      setOtpDialogOpen(true);
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error("Failed to send OTP:", error);
    }
  };

  const handleOtpSuccess = () => {
    setOtpDialogOpen(false);
    router.push("/wallet/withdraw/success");
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="h-9 w-9 p-0"
        >
          ←
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Withdraw Form */}
      <WithdrawForm
        onSubmit={handleWithdrawSubmit}
        balance={wallet?.balance ?? 0}
        withdrawTimes={user?.withdrawTimes ?? 0}
        nextWithdrawResetAt={user?.nextWithdrawResetAt ?? null}
        accounts={wallet?.accounts ?? []}
        isSubmitting={sendOTPMutation.isPending}
      />

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("terms.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="mb-2 font-semibold">
              {t("terms.processingTime.title")}
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {t("terms.processingTime.duration")}</li>
              <li>• {t("terms.processingTime.weekdays")}</li>
              <li>• {t("terms.processingTime.saturday")}</li>
              <li>• {t("terms.processingTime.notification")}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">{t("terms.limits.title")}</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {t("terms.limits.monthly")}</li>
              <li>• {t("terms.limits.min")}</li>
              <li>• {t("terms.limits.max")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* OTP Dialog */}
      {withdrawData && (
        <WithdrawOTPDialog
          open={otpDialogOpen}
          onOpenChange={setOtpDialogOpen}
          withdrawData={withdrawData}
          onSuccess={handleOtpSuccess}
        />
      )}
    </div>
  );
}
