"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const t = useTranslations("wallet.payment.success");
  const locale = useLocale();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push(`/${locale}/wallet`);
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [router, locale]);

  const handleBackToWallet = () => {
    router.push(`/${locale}/wallet`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative animate-in zoom-in-95 fade-in duration-500 shadow-2xl border-green-500/20">
        <CardHeader className="text-center pb-2">
          {/* Success icon with animation */}
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-green-500/20 rounded-full animate-ping" />
            </div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50 animate-in zoom-in duration-700">
              <CheckCircle2 className="h-12 w-12 text-white animate-in zoom-in duration-1000 delay-300" />
            </div>
            {/* Sparkles */}
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-green-500 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-emerald-500 animate-pulse delay-500" />
          </div>

          {/* Title with animation */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700 delay-200">
            {t("title")}
          </h1>
        </CardHeader>

        <CardContent className="space-y-6 text-center animate-in slide-in-from-bottom duration-700 delay-300">
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("description")}
          </p>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4 px-6 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span>{t("redirectInfo")}</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-semibold animate-pulse">
                {countdown}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              onClick={handleBackToWallet}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              {t("backToWallet")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
