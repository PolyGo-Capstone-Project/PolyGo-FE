"use client";

import {
  Badge,
  BalanceCard,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  QuickActionsCard,
  SubscriptionCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { useUserTransactions, useUserWallet } from "@/hooks";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const locale = useLocale();
  // Fetch balance data
  const { data: balanceData, isLoading: isBalanceLoading } = useUserWallet();

  // Fetch recent transactions (only 5 most recent)
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions({
      params: {
        pageNumber: 1,
        pageSize: 5,
      },
    });

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
  const totalDeposit = balanceData?.payload.data.totalDeposit ?? 0;
  const pendingBalance = balanceData?.payload.data.pendingBalance ?? 0;

  const recentTransactions = transactionsData?.payload.data.items ?? [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Completed:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      Expired: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      Cancelled:
        "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.Cancelled;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Deposit: "text-green-600",
      Purchase: "text-red-600",
      Withdraw: "text-orange-600",
      Refund: "text-blue-600",
      Adjustment: "text-gray-600",
      AutoRenew: "text-indigo-600",
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="container mx-auto space-y-4 p-3 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your balance, subscriptions, and transactions
        </p>
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
            totalDeposit={totalDeposit}
          />

          {/* Recent Transactions Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>
                    Your latest transaction activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${locale}/wallet/transactions`}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="rounded-md border border-dashed py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="space-y-3 md:hidden">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="rounded-lg border bg-card p-3 shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium leading-tight">
                              {transaction.description ||
                                transaction.transactionType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                          <Badge
                            className={getStatusColor(
                              transaction.transactionStatus
                            )}
                          >
                            {transaction.transactionStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${getTypeColor(transaction.transactionType)}`}
                          >
                            {transaction.transactionType}
                          </span>
                          <span
                            className={`text-base font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden overflow-hidden rounded-md border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {formatDate(transaction.createdAt)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.description ||
                                transaction.transactionType}
                            </TableCell>
                            <TableCell>
                              <span
                                className={getTypeColor(
                                  transaction.transactionType
                                )}
                              >
                                {transaction.transactionType}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(
                                  transaction.transactionStatus
                                )}
                              >
                                {transaction.transactionStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
