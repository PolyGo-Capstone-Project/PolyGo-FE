"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconFilter,
  IconMessageCircle,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Label,
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
  Textarea,
} from "@/components/ui";
import { TransactionStatus, TransactionTypeEnum } from "@/constants";
import { useAdminTransactions, useUpdateInquiryTransaction } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  AdminTransactionItemType,
  GetTransactionAdminQueryType,
} from "@/models";
import { useTranslations } from "next-intl";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function InquiriesTab() {
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState<string>("all");
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransactionItemType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseNotes, setResponseNotes] = useState("");

  const queryParams = useMemo<GetTransactionAdminQueryType>(() => {
    const params: GetTransactionAdminQueryType = {
      pageNumber,
      pageSize,
      isInquiry: true,
    };

    if (description.trim()) {
      params.description = description.trim();
    }
    if (transactionType && transactionType !== "all") {
      params.transactionType = transactionType as any;
    }
    if (transactionStatus && transactionStatus !== "all") {
      params.transactionStatus = transactionStatus as any;
    }

    return params;
  }, [pageNumber, pageSize, description, transactionType, transactionStatus]);

  const { data, isLoading, isFetching, refetch } = useAdminTransactions({
    params: queryParams,
  });

  const updateInquiryMutation = useUpdateInquiryTransaction();

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
    setTransactionStatus("all");
    setPageNumber(1);
  };

  const handleOpenDialog = (transaction: AdminTransactionItemType) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
    setResponseNotes("");
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
    setResponseNotes("");
  };

  const handleSubmit = async () => {
    if (!selectedTransaction) return;

    try {
      await updateInquiryMutation.mutateAsync({
        id: selectedTransaction.id,
        body: {
          userNotes: responseNotes.trim() || undefined,
        },
      });
      showSuccessToast("Inquiry updated successfully", tSuccess);
      handleCloseDialog();
      refetch();
    } catch (error) {
      handleErrorApi({ error, tError });
    }
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

  const isSubmitting = updateInquiryMutation.isPending;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Filter inquiry transactions by description, type, and status
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
                <SelectTrigger className="w-[160px]">
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
                <CardTitle>Transaction Inquiries</CardTitle>
                <CardDescription>
                  Transactions with inquiry requests ({totalItems} total)
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
                    <EmptyTitle>No inquiries found</EmptyTitle>
                    <EmptyDescription>
                      There are no transaction inquiries matching your filters.
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
                      <TableHead>Status</TableHead>
                      <TableHead>User Notes</TableHead>
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
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(
                              transaction.transactionStatus
                            )}
                          >
                            {transaction.transactionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-xs truncate">
                            {transaction.userNotes || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(transaction)}
                          >
                            <IconMessageCircle className="h-4 w-4 mr-1" />
                            Respond
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

      {/* Response Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Transaction Inquiry</DialogTitle>
            <DialogDescription>
              Review the inquiry details and provide a response to the user.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Amount
                  </Label>
                  <p className="font-semibold">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Transaction Type
                  </Label>
                  <Badge
                    variant={getTypeBadgeVariant(
                      selectedTransaction.transactionType
                    )}
                  >
                    {selectedTransaction.transactionType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusBadgeVariant(
                      selectedTransaction.transactionStatus
                    )}
                  >
                    {selectedTransaction.transactionStatus}
                  </Badge>
                </div>
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p>{selectedTransaction.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    User Inquiry
                  </Label>
                  <p className="text-sm bg-background p-3 rounded border">
                    {selectedTransaction.userNotes || "No notes provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Created At
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(selectedTransaction.lastUpdatedAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseNotes">Admin Response (Optional)</Label>
                <Textarea
                  id="responseNotes"
                  placeholder="Provide a response or update for this inquiry..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This response will be visible to the user and update the
                  inquiry status.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                "Update Inquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
