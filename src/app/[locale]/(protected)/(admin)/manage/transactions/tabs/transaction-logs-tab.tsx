"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconFilter,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import { TransactionDetailDialog } from "@/components/modules/wallet";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  TransactionMethod,
  TransactionStatus,
  TransactionTypeEnum,
} from "@/constants";
import { useAdminTransactions } from "@/hooks";
import { GetTransactionAdminQueryType } from "@/models";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function TransactionLogsTab() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState<string>("all");
  const [transactionMethod, setTransactionMethod] = useState<string>("all");
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const queryParams = useMemo<GetTransactionAdminQueryType>(() => {
    const params: GetTransactionAdminQueryType = {
      pageNumber,
      pageSize,
    };

    if (description.trim()) {
      params.description = description.trim();
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
    description,
    transactionType,
    transactionMethod,
    transactionStatus,
  ]);

  const { data, isLoading, isFetching, refetch } = useAdminTransactions({
    params: queryParams,
  });

  const transactions = data?.payload?.data?.items ?? [];
  const totalItems = data?.payload?.data?.totalItems ?? 0;
  const currentPage = data?.payload?.data?.currentPage ?? pageNumber;
  const totalPages = data?.payload?.data?.totalPages ?? 0;
  const hasPreviousPage = data?.payload?.data?.hasPreviousPage ?? false;
  const hasNextPage = data?.payload?.data?.hasNextPage ?? false;

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && hasPreviousPage) {
      setPageNumber((prev) => Math.max(prev - 1, 1));
    }
    if (direction === "next" && hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPageNumber(1);
  };

  const handleReset = () => {
    setDescription("");
    setTransactionType("all");
    setTransactionMethod("all");
    setTransactionStatus("all");
    setPageNumber(1);
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Pending":
        return "secondary";
      case "Cancelled":
        return "destructive";
      case "Expired":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Deposit":
        return "default";
      case "Withdraw":
        return "secondary";
      case "Purchase":
        return "outline";
      case "Refund":
        return "default";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Filter transactions by description, type, method, and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
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
                <SelectTrigger className=" w-[160px]">
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
              <Button onClick={() => refetch()} variant="outline" size="icon">
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction Logs</CardTitle>
                <CardDescription>
                  All transactions in the system ({totalItems} total)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Spinner />
                </div>
              )}

              {!isLoading && transactions.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No transactions found</EmptyTitle>
                    <EmptyDescription>
                      There are no transactions matching your filters.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inquiry</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs">
                          {transaction.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description || "—"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTypeBadgeVariant(
                              transaction.transactionType
                            )}
                          >
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.transactionMethod}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(
                              transaction.transactionStatus
                            )}
                          >
                            {transaction.transactionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.isInquiry ? (
                            <Badge variant="destructive">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(transaction.id)}
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page:
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange("prev")}
                      disabled={!hasPreviousPage}
                    >
                      <IconArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange("next")}
                      disabled={!hasNextPage}
                    >
                      <IconArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Dialog */}
      {selectedTransactionId && (
        <TransactionDetailDialog
          transactionId={selectedTransactionId}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </>
  );
}
