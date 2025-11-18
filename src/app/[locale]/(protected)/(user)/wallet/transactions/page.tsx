"use client";

import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { TransactionHistory } from "@/components";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const t = useTranslations("wallet");
  const locale = useLocale();

  return (
    <div className="container mx-auto space-y-4 p-3 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${locale}/wallet`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("transactions.title")}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            View and manage all your transaction history
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  );
}
