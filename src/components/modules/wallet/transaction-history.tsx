"use client";

import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TransactionEnumType,
  TransactionStatusType,
} from "@/constants/transaction.constant";
import { TransactionListItemType } from "@/models";

interface TransactionHistoryProps {
  transactions: TransactionListItemType[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function TransactionHistory({
  transactions,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: TransactionHistoryProps) {
  const t = useTranslations("wallet.transactions");
  const tToast = useTranslations("wallet.toast");
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("vi-VN").format(Math.abs(amount));
    return amount >= 0 ? `+${formatted} VND` : `-${formatted} VND`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filter !== "all") {
      const typeMap: Record<string, TransactionEnumType[]> = {
        deposits: ["Deposit"],
        purchases: ["Purchase", "Gift", "AutoRenew"],
        withdrawals: ["Withdraw"],
        refunds: ["Refund"],
        adjustments: ["Adjustment"],
      };
      filtered = filtered.filter((t) =>
        typeMap[filter]?.includes(t.transactionType)
      );
    }

    // Filter by search - search in transaction type
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, filter, searchQuery]);

  const handleExport = (format: "csv" | "excel") => {
    try {
      if (format === "csv") {
        exportToCSV(filteredTransactions);
      } else {
        exportToExcel(filteredTransactions);
      }
      toast.success(tToast("exportSuccess"));
    } catch (error) {
      toast.error(tToast("exportError"));
    }
  };

  const exportToCSV = (data: TransactionListItemType[]) => {
    const headers = ["Date", "Description", "Type", "Amount", "Status"];
    const rows = data.map((t) => [
      formatDate(t.createdAt),
      t.transactionType,
      t.transactionType,
      t.amount.toString(),
      t.transactionStatus,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().getTime()}.csv`;
    link.click();
  };

  const exportToExcel = (data: TransactionListItemType[]) => {
    const headers = ["Date", "Description", "Type", "Amount", "Status"];
    const rows = data.map((t) => [
      formatDate(t.createdAt),
      t.transactionType,
      t.transactionType,
      t.amount.toString(),
      t.transactionStatus,
    ]);

    const csv = [headers, ...rows].map((row) => row.join("\t")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "application/vnd.ms-excel",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().getTime()}.xlsx`;
    link.click();
  };

  const getStatusColor = (status: TransactionStatusType) => {
    const colors = {
      Completed:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      Failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      Cancelled:
        "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status];
  };

  const getTypeColor = (type: TransactionEnumType) => {
    const colors = {
      Deposit: "text-green-600",
      Purchase: "text-red-600",
      Withdraw: "text-orange-600",
      Gift: "text-purple-600",
      Refund: "text-blue-600",
      Adjustment: "text-gray-600",
      AutoRenew: "text-indigo-600",
    };
    return colors[type];
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 md:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
          <CardTitle className="text-lg md:text-xl">{t("title")}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] text-xs md:w-[180px] md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                <SelectItem value="deposits">{t("filter.deposits")}</SelectItem>
                <SelectItem value="purchases">
                  {t("filter.purchases")}
                </SelectItem>
                <SelectItem value="withdrawals">
                  {t("filter.withdrawals")}
                </SelectItem>
                <SelectItem value="refunds">{t("filter.refunds")}</SelectItem>
                <SelectItem value="adjustments">
                  {t("filter.adjustments")}
                </SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs md:gap-2 md:text-sm"
                >
                  <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{t("export.button")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t("export.csv")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  {t("export.excel")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:h-4 md:w-4" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm md:h-10 md:text-base"
          />
        </div>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {filteredTransactions.length === 0 ? (
                <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  {t("empty")}
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-tight">
                          {t(`type.${transaction.transactionType}`)}
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
                        {t(`status.${transaction.transactionStatus}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${getTypeColor(transaction.transactionType)}`}
                      >
                        {t(`type.${transaction.transactionType}`)}
                      </span>
                      <span
                        className={`text-base font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.date")}</TableHead>
                    <TableHead>{t("columns.description")}</TableHead>
                    <TableHead>{t("columns.type")}</TableHead>
                    <TableHead className="text-right">
                      {t("columns.amount")}
                    </TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        {t("empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {t(`type.${transaction.transactionType}`)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={getTypeColor(
                              transaction.transactionType
                            )}
                          >
                            {t(`type.${transaction.transactionType}`)}
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
                            {t(`status.${transaction.transactionStatus}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                showPageSizeSelector={true}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
