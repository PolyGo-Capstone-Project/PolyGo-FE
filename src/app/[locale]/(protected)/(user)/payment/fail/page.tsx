"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCancelPayment } from "@/hooks";
import { AlertCircle, ArrowLeft, RotateCcw, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

function PaymentFailContent() {
  const t = useTranslations("wallet.payment.fail");
  const tToast = useTranslations("wallet.toast");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: cancelPayment } = useCancelPayment();

  useEffect(() => {
    // Get orderCode from URL params
    const orderCode = Number(searchParams.get("orderCode"));

    if (!orderCode) {
      toast.error(tToast("cancelPaymentError"));
      return;
    }

    // Call cancel payment API when user lands on this page
    cancelPayment(
      { orderCode },
      {
        onSuccess: () => {
          // Payment cancelled successfully
          console.log("Payment cancelled successfully");
        },
        onError: () => {
          toast.error(tToast("cancelPaymentError"));
        },
      }
    );
  }, [cancelPayment, tToast, searchParams]);

  const handleBackToWallet = () => {
    router.push(`/${locale}/wallet`);
  };

  const handleTryAgain = () => {
    router.push(`/${locale}/wallet`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative animate-in zoom-in-95 fade-in duration-500 shadow-2xl border-red-500/20">
        <CardHeader className="text-center pb-2">
          {/* Error icon with animation */}
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full animate-ping" />
            </div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/50 animate-in zoom-in duration-700">
              <XCircle className="h-12 w-12 text-white animate-in zoom-in duration-1000 delay-300" />
            </div>
            {/* Alert icons */}
            <AlertCircle className="absolute -top-2 -right-2 h-6 w-6 text-red-500 animate-pulse" />
            <AlertCircle className="absolute -bottom-2 -left-2 h-5 w-5 text-orange-500 animate-pulse delay-500" />
          </div>

          {/* Title with animation */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700 delay-200">
            {t("title")}
          </h1>
        </CardHeader>

        <CardContent className="space-y-6 text-center animate-in slide-in-from-bottom duration-700 delay-300">
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("description")}
          </p>

          {/* Info box */}
          <div className="flex items-start gap-3 text-sm text-muted-foreground py-4 px-6 bg-muted/50 rounded-lg text-left">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t("reasonInfo")}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleTryAgain}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("tryAgain")}
            </Button>
            <Button
              onClick={handleBackToWallet}
              variant="outline"
              className="w-full h-11 border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToWallet")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
