"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  BalanceCard,
  QuickActionsCard,
  SubscriptionCard,
  TransactionHistory,
} from "@/components";
import { useUserTransactions, useUserWallet } from "@/hooks";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch balance data
  const { data: balanceData, isLoading: isBalanceLoading } = useUserWallet();

  // Fetch transactions with pagination
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions({
      params: {
        pageNumber: currentPage,
        pageSize: pageSize,
      },
    });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (isBalanceLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const balance = balanceData?.payload.data.balance ?? 0;
  const totalEarned = balanceData?.payload.data.totalEarned ?? 0;
  const totalSpent = balanceData?.payload.data.totalSpent ?? 0;
  const totalWithdrawn = balanceData?.payload.data.totalWithdrawn ?? 0;
  const pendingBalance = balanceData?.payload.data.pendingBalance ?? 0;

  const transactions = transactionsData?.payload.data.items ?? [];
  const meta = transactionsData?.payload.data;

  return (
    <div className="container mx-auto space-y-4 p-3 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
      </div>

      {/* Main Layout: 6:4 ratio on desktop, stacked on mobile */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-10">
        {/* Left Side - 6 parts */}
        <div className="space-y-4 md:space-y-6 lg:col-span-6">
          {/* Balance Card */}
          <BalanceCard
            balance={balance}
            totalEarned={totalEarned}
            totalSpent={totalSpent}
            totalWithdrawn={totalWithdrawn}
            pendingBalance={pendingBalance}
          />

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            currentPage={meta?.currentPage ?? 1}
            totalPages={meta?.totalPages ?? 1}
            totalItems={meta?.totalItems ?? 0}
            pageSize={meta?.pageSize ?? pageSize}
            hasNextPage={meta?.hasNextPage ?? false}
            hasPreviousPage={meta?.hasPreviousPage ?? false}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isTransactionsLoading}
          />
        </div>

        {/* Right Side - 4 parts */}
        <div className="space-y-4 md:space-y-6 lg:col-span-4">
          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Current Subscription */}
          <SubscriptionCard />
        </div>
      </div>
    </div>
  );
}
