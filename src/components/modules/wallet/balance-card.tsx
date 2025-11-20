"use client";

import {
  Banknote,
  CreditCard,
  Eye,
  EyeOff,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ManageBankAccountDialog } from "@/components/modules/wallet/manage-bank-account-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BalanceCardProps {
  balance: number;
  totalEarned?: number;
  totalSpent?: number;
  totalWithdrawn?: number;
  pendingBalance?: number;
  totalDeposit?: number;
}

export function BalanceCard({
  balance,
  totalEarned = 0,
  totalSpent = 0,
  totalWithdrawn = 0,
  pendingBalance = 0,
  totalDeposit = 0,
}: BalanceCardProps) {
  const t = useTranslations("wallet.balance");
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Wallet className="h-4 w-4 md:h-5 md:w-5" />
            {t("title")}
          </CardTitle>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-accent md:gap-2 md:px-3 md:text-sm"
          >
            {showBalance ? (
              <>
                <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{t("hide")}</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{t("show")}</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground md:mb-2 md:text-sm">
                {t("title")}
              </p>
              <p className="text-2xl font-bold md:text-4xl">
                {showBalance ? formatCurrency(balance) : "••••••••"} {}
                {pendingBalance > 0 && showBalance && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground md:text-base">
                    ({t("pending")}: {formatCurrency(pendingBalance)})
                  </span>
                )}
              </p>
            </div>
            <ManageBankAccountDialog />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <CreditCard className="h-3.5 w-3.5 text-blue-500 md:h-4 md:w-4" />
              <span className="line-clamp-1">{t("totalDeposit")}</span>
            </div>
            <p className="text-base font-semibold text-blue-600 md:text-xl">
              {showBalance ? formatCurrency(totalDeposit) : "••••••••"}
            </p>
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <TrendingUp className="h-3.5 w-3.5 text-green-500 md:h-4 md:w-4" />
              <span className="line-clamp-1">{t("totalEarned")}</span>
            </div>
            <p className="text-base font-semibold text-green-600 md:text-xl">
              {showBalance ? formatCurrency(totalEarned) : "••••••••"}
            </p>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <ShoppingCart className="h-3.5 w-3.5 text-red-500 md:h-4 md:w-4" />
              <span className="line-clamp-1">{t("totalSpent")}</span>
            </div>
            <p className="text-base font-semibold text-red-600 md:text-xl">
              {showBalance ? formatCurrency(totalSpent) : "••••••••"}
            </p>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <Banknote className="h-3.5 w-3.5 text-orange-500 md:h-4 md:w-4" />
              <span className="line-clamp-1">{t("totalWithdrawn")}</span>
            </div>
            <p className="text-base font-semibold text-orange-600 md:text-xl">
              {showBalance ? formatCurrency(totalWithdrawn) : "••••••••"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
