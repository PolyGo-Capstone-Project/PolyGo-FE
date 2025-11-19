"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
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
import { TransactionStatus } from "@/constants";
import {
  useAdminTransactions,
  useUploadMediaMutation,
  useWithdrawalApprove,
  useWithdrawalCancel,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  AdminTransactionItemType,
  GetTransactionAdminQueryType,
} from "@/models";
import { useTranslations } from "next-intl";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function WithdrawalRequestsTab() {
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [description, setDescription] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransactionItemType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "cancel" | null>(
    null
  );
  const [systemNotes, setSystemNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const queryParams = useMemo<GetTransactionAdminQueryType>(() => {
    const params: GetTransactionAdminQueryType = {
      pageNumber,
      pageSize,
      transactionType: "Withdraw",
    };

    if (description.trim()) {
      params.description = description.trim();
    }
    if (transactionStatus && transactionStatus !== "all") {
      params.transactionStatus = transactionStatus as any;
    }

    return params;
  }, [pageNumber, pageSize, description, transactionStatus]);

  const { data, isLoading, isFetching, refetch } = useAdminTransactions({
    params: queryParams,
  });

  const withdrawalCancelMutation = useWithdrawalCancel();
  const withdrawalApproveMutation = useWithdrawalApprove();
  const uploadMediaMutation = useUploadMediaMutation();

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
    setTransactionStatus("all");
    setPageNumber(1);
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDialog = (
    transaction: AdminTransactionItemType,
    action: "approve" | "cancel"
  ) => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setDialogOpen(true);
    setSystemNotes("");
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
    setActionType(null);
    setSystemNotes("");
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTransaction) return;

    try {
      if (actionType === "cancel") {
        await withdrawalCancelMutation.mutateAsync({
          id: selectedTransaction.id,
          body: {
            systemNotes: systemNotes.trim() || undefined,
          },
        });
        showSuccessToast("Withdrawal request cancelled successfully", tSuccess);
      } else if (actionType === "approve") {
        let withdrawalApprovedImageUrl: string | undefined;

        if (receiptFile) {
          const uploadResponse = await uploadMediaMutation.mutateAsync({
            file: receiptFile,
            addUniqueName: true,
          });
          withdrawalApprovedImageUrl =
            uploadResponse.payload?.data ?? undefined;
        }

        await withdrawalApproveMutation.mutateAsync({
          id: selectedTransaction.id,
          body: {
            withdrawalApprovedImageUrl,
          },
        });
        showSuccessToast("Withdrawal request approved successfully", tSuccess);
      }

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

  const isSubmitting =
    withdrawalCancelMutation.isPending ||
    withdrawalApproveMutation.isPending ||
    uploadMediaMutation.isPending;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Filter withdrawal requests by description and status
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
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>
                  Manage withdrawal requests ({totalItems} total)
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
                    <EmptyTitle>No withdrawal requests found</EmptyTitle>
                    <EmptyDescription>
                      There are no withdrawal requests matching your filters.
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
                      <TableHead>Bank Info</TableHead>
                      <TableHead>Status</TableHead>
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
                          <div className="text-xs">
                            <div>{transaction.bankName || "—"}</div>
                            <div className="text-muted-foreground">
                              {transaction.bankNumber || "—"}
                            </div>
                            <div className="text-muted-foreground">
                              {transaction.accountName || "—"}
                            </div>
                          </div>
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
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(transaction.id)}
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                            {transaction.transactionStatus === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    handleOpenDialog(transaction, "approve")
                                  }
                                >
                                  <IconCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleOpenDialog(transaction, "cancel")
                                  }
                                >
                                  <IconX className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Withdrawal Request"
                : "Cancel Withdrawal Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Review and approve this withdrawal request. Upload a receipt image if available."
                : "Cancel this withdrawal request. You can provide a reason for cancellation."}
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
                    Bank Name
                  </Label>
                  <p>{selectedTransaction.bankName || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Bank Number
                  </Label>
                  <p className="font-mono">
                    {selectedTransaction.bankNumber || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Account Name
                  </Label>
                  <p>{selectedTransaction.accountName || "—"}</p>
                </div>
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p>{selectedTransaction.description}</p>
                  </div>
                )}
              </div>

              {actionType === "approve" && (
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Receipt Image</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("receipt-input")?.click()
                      }
                      disabled={isSubmitting}
                    >
                      <IconUpload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    {receiptFile && (
                      <span className="text-sm text-muted-foreground">
                        {receiptFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    id="receipt-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {receiptPreview && (
                    <div className="mt-2">
                      <Image
                        src={receiptPreview}
                        alt="Receipt preview"
                        width={500}
                        height={256}
                        className="max-w-full h-auto max-h-64 rounded-lg border object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {actionType === "cancel" && (
                <div className="space-y-2">
                  <Label htmlFor="systemNotes">
                    Cancellation Reason (Optional)
                  </Label>
                  <Textarea
                    id="systemNotes"
                    placeholder="Provide a reason for cancelling this withdrawal request..."
                    value={systemNotes}
                    onChange={(e) => setSystemNotes(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>
              )}
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
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Cancel Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
