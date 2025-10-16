"use client";

import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

export type TransactionType =
  | "earning"
  | "spending"
  | "withdrawal"
  | "subscription"
  | "refund";

export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
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
      const typeMap: Record<string, TransactionType[]> = {
        earnings: ["earning"],
        spending: ["spending"],
        withdrawals: ["withdrawal"],
        subscriptions: ["subscription"],
        refunds: ["refund"],
      };
      filtered = filtered.filter((t) => typeMap[filter]?.includes(t.type));
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const exportToCSV = (data: Transaction[]) => {
    const headers = ["Date", "Description", "Type", "Amount", "Status"];
    const rows = data.map((t) => [
      formatDate(t.date),
      t.description,
      t.type,
      t.amount.toString(),
      t.status,
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

  const exportToExcel = (data: Transaction[]) => {
    // For simplicity, export as CSV with .xlsx extension
    // In production, you'd use a library like xlsx
    const headers = ["Date", "Description", "Type", "Amount", "Status"];
    const rows = data.map((t) => [
      formatDate(t.date),
      t.description,
      t.type,
      t.amount.toString(),
      t.status,
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

  const getStatusColor = (status: TransactionStatus) => {
    const colors = {
      completed:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status];
  };

  const getTypeColor = (type: TransactionType) => {
    const colors = {
      earning: "text-green-600",
      spending: "text-red-600",
      withdrawal: "text-orange-600",
      subscription: "text-purple-600",
      refund: "text-blue-600",
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
                <SelectItem value="earnings">{t("filter.earnings")}</SelectItem>
                <SelectItem value="spending">{t("filter.spending")}</SelectItem>
                <SelectItem value="withdrawals">
                  {t("filter.withdrawals")}
                </SelectItem>
                <SelectItem value="subscriptions">
                  {t("filter.subscriptions")}
                </SelectItem>
                <SelectItem value="refunds">{t("filter.refunds")}</SelectItem>
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
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {t(`status.${transaction.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${getTypeColor(transaction.type)}`}>
                    {t(`type.${transaction.type}`)}
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
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <span className={getTypeColor(transaction.type)}>
                        {t(`type.${transaction.type}`)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {t(`status.${transaction.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
