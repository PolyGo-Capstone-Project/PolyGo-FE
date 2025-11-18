"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components";
import { Pagination } from "@/components/shared";
import {
  TransactionMethod,
  TransactionStatus,
  TransactionTypeEnum,
} from "@/constants/transaction.constant";
import { useInquiryTransaction, useUserTransactions } from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import {
  GetTransactionAdminQueryType,
  UserTransactionItemType,
} from "@/models";
import { IconFilter } from "@tabler/icons-react";
import {
  FileImage,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export function TransactionHistory() {
  const t = useTranslations("wallet.transactions");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  // Pagination & filter states
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<string | undefined>(
    undefined
  );
  const [transactionMethod, setTransactionMethod] = useState<
    string | undefined
  >(undefined);
  const [transactionStatus, setTransactionStatus] = useState<
    string | undefined
  >(undefined);

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] =
    useState<UserTransactionItemType | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [inquiryNotes, setInquiryNotes] = useState("");

  // Build query params
  const queryParams = useMemo<GetTransactionAdminQueryType>(() => {
    const params: GetTransactionAdminQueryType = {
      pageNumber,
      pageSize,
    };

    if (searchQuery.trim()) {
      params.description = searchQuery.trim();
    }
    if (transactionType && transactionType !== "all") {
      params.transactionType = transactionType as any;
    }
    if (transactionMethod && transactionMethod !== "all") {
      params.transactionMethod = transactionMethod as any;
    }
    if (transactionStatus && transactionStatus !== "all") {
      params.transactionStatus = transactionStatus as any;
    }

    return params;
  }, [
    pageNumber,
    pageSize,
    searchQuery,
    transactionType,
    transactionMethod,
    transactionStatus,
  ]);

  // Query transactions
  const { data, isLoading } = useUserTransactions({
    params: queryParams,
  });

  const transactions = data?.payload?.data?.items ?? [];
  const totalItems = data?.payload?.data?.totalItems ?? 0;
  const currentPage = data?.payload?.data?.currentPage ?? pageNumber;
  const totalPages = data?.payload?.data?.totalPages ?? 0;
  const hasPreviousPage = data?.payload?.data?.hasPreviousPage ?? false;
  const hasNextPage = data?.payload?.data?.hasNextPage ?? false;

  // Inquiry mutation
  const inquiryMutation = useInquiryTransaction();

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

  const handleExport = (format: "csv" | "excel") => {
    try {
      if (format === "csv") {
        exportToCSV(transactions);
      } else {
        exportToExcel(transactions);
      }
      showSuccessToast("export", tSuccess);
    } catch (error) {
      showErrorToast("export", tError);
    }
  };

  const exportToCSV = (data: UserTransactionItemType[]) => {
    const headers = [
      "Date",
      "Description",
      "Type",
      "Method",
      "Amount",
      "Status",
    ];
    const rows = data.map((t) => [
      formatDate(t.createdAt),
      t.description || "",
      t.transactionType,
      t.transactionMethod,
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

  const exportToExcel = (data: UserTransactionItemType[]) => {
    const headers = [
      "Date",
      "Description",
      "Type",
      "Method",
      "Amount",
      "Status",
    ];
    const rows = data.map((t) => [
      formatDate(t.createdAt),
      t.description || "",
      t.transactionType,
      t.transactionMethod,
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

  const handleReset = () => {
    setSearchQuery("");
    setTransactionType(undefined);
    setTransactionMethod(undefined);
    setTransactionStatus(undefined);
    setPageNumber(1);
  };

  const handleViewReceipt = (transaction: UserTransactionItemType) => {
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };

  const handleOpenInquiry = (transaction: UserTransactionItemType) => {
    setSelectedTransaction(transaction);
    setInquiryNotes("");
    setIsInquiryDialogOpen(true);
  };

  const handleSubmitInquiry = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await inquiryMutation.mutateAsync({
        id: selectedTransaction.id,
        body: {
          userNotes: inquiryNotes,
        },
      });
      showSuccessToast(response.payload.message, tSuccess);
      setIsInquiryDialogOpen(false);
      setInquiryNotes("");
      setSelectedTransaction(null);
    } catch (error) {
      showErrorToast("SendTransactionInquiry", tError);
    }
  };

  const canViewReceipt = (transaction: UserTransactionItemType) => {
    return (
      transaction.transactionType === "Withdraw" &&
      transaction.transactionStatus === "Completed" &&
      !!transaction.withdrawalApprovedImageUrl
    );
  };

  const canInquiry = (transaction: UserTransactionItemType) => {
    return (
      transaction.transactionStatus === "Completed" && !transaction.isInquiry
    );
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
            <CardTitle className="text-lg md:text-xl">{t("title")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs md:gap-2 md:text-sm"
                  >
                    <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">
                      {t("export.button")}
                    </span>
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
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className=" w-[160px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(TransactionTypeEnum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={transactionMethod}
              onValueChange={setTransactionMethod}
            >
              <SelectTrigger className=" w-[160px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {Object.values(TransactionMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={transactionStatus}
              onValueChange={setTransactionStatus}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(TransactionStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleReset} variant="outline">
              <IconFilter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {transactions.length === 0 ? (
                  <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                    {t("empty")}
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium leading-tight">
                            {transaction.description ||
                              t(`type.${transaction.transactionType}`)}
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
                      <div className="mt-2 flex gap-2">
                        {canViewReceipt(transaction) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReceipt(transaction)}
                          >
                            <FileImage className="mr-1 h-3 w-3" />
                            Receipt
                          </Button>
                        )}
                        {canInquiry(transaction) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenInquiry(transaction)}
                          >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Inquiry
                          </Button>
                        )}
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
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">
                        {t("columns.amount")}
                      </TableHead>
                      <TableHead>{t("columns.status")}</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          {t("empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description ||
                              t(`type.${transaction.transactionType}`)}
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
                          <TableCell>{transaction.transactionMethod}</TableCell>
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
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              {canViewReceipt(transaction) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewReceipt(transaction)}
                                >
                                  <FileImage className="mr-1 h-3.5 w-3.5" />
                                  Receipt
                                </Button>
                              )}
                              {canInquiry(transaction) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenInquiry(transaction)}
                                >
                                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                                  Inquiry
                                </Button>
                              )}
                            </div>
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
                  onPageChange={setPageNumber}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPageNumber(1);
                  }}
                  showPageSizeSelector={true}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Receipt</DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-semibold">
                  {selectedTransaction &&
                    formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-semibold">
                  {selectedTransaction &&
                    formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
              {selectedTransaction?.bankName && (
                <div>
                  <Label className="text-muted-foreground">Bank Name</Label>
                  <p className="font-semibold">
                    {selectedTransaction.bankName}
                  </p>
                </div>
              )}
              {selectedTransaction?.accountName && (
                <div>
                  <Label className="text-muted-foreground">Account Name</Label>
                  <p className="font-semibold">
                    {selectedTransaction.accountName}
                  </p>
                </div>
              )}
            </div>
            {selectedTransaction?.withdrawalApprovedImageUrl && (
              <div>
                <Label className="mb-2 block text-muted-foreground">
                  Transfer Receipt
                </Label>
                <img
                  src={selectedTransaction.withdrawalApprovedImageUrl}
                  alt="Withdrawal Receipt"
                  className="w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inquiry Dialog */}
      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Inquiry</DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-semibold">
                  {selectedTransaction &&
                    formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-semibold">
                  {selectedTransaction?.transactionType}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="inquiry-notes">Notes (Optional)</Label>
              <Textarea
                id="inquiry-notes"
                placeholder="Describe your issue or question..."
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInquiryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInquiry}
                disabled={inquiryMutation.isPending}
              >
                {inquiryMutation.isPending ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
