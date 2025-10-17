"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  BalanceCard,
  QuickActionsCard,
  SubscriptionCard,
  Transaction,
  TransactionHistory,
} from "@/components";
import { useAuthMe } from "@/hooks";
import {
  useCurrentSubscriptionQuery,
  useSubscriptionUsageQuery,
} from "@/hooks/query/use-subscription"; // NEW

// Mock data for transactions
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-10-15T10:30:00Z",
    description: "Deposit to wallet",
    type: "earning",
    amount: 500000,
    status: "completed",
  },
  {
    id: "2",
    date: "2025-10-14T15:20:00Z",
    description: "Premium subscription purchase",
    type: "subscription",
    amount: -199000,
    status: "completed",
  },
  {
    id: "3",
    date: "2025-10-14T09:15:00Z",
    description: "Gift to friend",
    type: "spending",
    amount: -50000,
    status: "completed",
  },
  {
    id: "4",
    date: "2025-10-13T14:45:00Z",
    description: "Withdrawal to bank account",
    type: "withdrawal",
    amount: -300000,
    status: "pending",
  },
  {
    id: "5",
    date: "2025-10-12T11:20:00Z",
    description: "Refund from cancelled transaction",
    type: "refund",
    amount: 100000,
    status: "completed",
  },
  {
    id: "6",
    date: "2025-10-11T16:30:00Z",
    description: "Quest completion reward",
    type: "earning",
    amount: 75000,
    status: "completed",
  },
  {
    id: "7",
    date: "2025-10-10T13:10:00Z",
    description: "Sticker pack purchase",
    type: "spending",
    amount: -25000,
    status: "completed",
  },
  {
    id: "8",
    date: "2025-10-09T10:05:00Z",
    description: "Basic subscription renewal",
    type: "subscription",
    amount: -99000,
    status: "failed",
  },
  {
    id: "9",
    date: "2025-10-08T14:20:00Z",
    description: "Promotional deposit bonus",
    type: "earning",
    amount: 1000000,
    status: "completed",
  },
  {
    id: "10",
    date: "2025-10-07T09:30:00Z",
    description: "Cash withdrawal",
    type: "withdrawal",
    amount: -500000,
    status: "completed",
  },
  {
    id: "11",
    date: "2025-10-06T16:20:00Z",
    description: "Event participation reward",
    type: "earning",
    amount: 150000,
    status: "completed",
  },
  {
    id: "12",
    date: "2025-10-05T11:45:00Z",
    description: "Language course materials",
    type: "spending",
    amount: -120000,
    status: "completed",
  },
];

export default function WalletPage() {
  const t = useTranslations("wallet");
  const { data: userData, isLoading } = useAuthMe();

  // NEW: fetch current subscription & usage
  const currentSubQuery = useCurrentSubscriptionQuery(true);
  const usageQuery = useSubscriptionUsageQuery(
    { pageNumber: 1, pageSize: 10 },
    true
  );

  const subData = currentSubQuery.data?.payload?.data ?? null;
  const usageItems = usageQuery.data?.payload?.data?.items ?? [];

  // Calculate total earned and spent from transactions
  const { totalEarned, totalSpent } = useMemo(() => {
    const earned = mockTransactions
      .filter((t) => t.amount > 0 && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const spent = mockTransactions
      .filter((t) => t.amount < 0 && t.status === "completed")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalEarned: earned, totalSpent: spent };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const balance = userData?.payload.data.balance ?? 0;
  const autoRenewSubscription =
    userData?.payload.data.autoRenewSubscription ?? false;

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
          />

          {/* Transaction History */}
          <TransactionHistory transactions={mockTransactions} />
        </div>

        {/* Right Side - 4 parts */}
        <div className="space-y-4 md:space-y-6 lg:col-span-4">
          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Current Subscription */}
          <SubscriptionCard
            // legacy fallback props ( vẫn support )
            plan="free"
            status={subData?.active ? "active" : "inactive"}
            nextBilling={subData?.endAt ?? "N/A"}
            autoRenew={subData?.autoRenew ?? autoRenewSubscription}
            // NEW: rich data to render giống Profile
            current={subData}
            usage={usageItems}
            loadingCurrent={currentSubQuery.isLoading}
            loadingUsage={usageQuery.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
