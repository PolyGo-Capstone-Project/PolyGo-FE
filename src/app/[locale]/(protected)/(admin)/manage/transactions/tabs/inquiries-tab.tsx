"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconFilter,
  IconMessageCircle,
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
import {
  useAdminTransactions,
  useTransactionDetail,
  useUpdateInquiryTransaction,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  AdminTransactionItemType,
  GetTransactionAdminQueryType,
} from "@/models";
import { useTranslations } from "next-intl";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function InquiriesTab() {
  const t = useTranslations("admin.transactions.inquiries");
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
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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

  // Fetch transaction detail for the response dialog
  const { data: transactionDetailData } = useTransactionDetail({
    id: selectedTransaction?.id ?? "",
    enabled: dialogOpen && !!selectedTransaction?.id,
  });

  const transactionDetail = transactionDetailData?.payload?.data;

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

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDetailDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTransaction || !transactionDetail?.userNotes?.[0]?.id) return;

    try {
      const result = await updateInquiryMutation.mutateAsync({
        id: selectedTransaction.id,
        body: {
          userNotesId: transactionDetail.userNotes[0].id,
          systemNotes: responseNotes.trim(),
        },
      });
      showSuccessToast(result.payload.message, tSuccess);
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
            <CardTitle>{t("searchFilter.title")}</CardTitle>
            <CardDescription>{t("searchFilter.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchFilter.searchPlaceholder")}
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
                  <SelectValue
                    placeholder={t("searchFilter.transactionType")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("searchFilter.allTypes")}
                  </SelectItem>
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
                  <SelectValue placeholder={t("searchFilter.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("searchFilter.allStatus")}
                  </SelectItem>
                  {Object.values(TransactionStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleReset} variant="outline">
                <IconFilter className="mr-2 h-4 w-4" />
                {t("searchFilter.reset")}
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
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>
                  {t("description", { totalItems })}
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
                    <EmptyTitle>{t("table.noData")}</EmptyTitle>
                    <EmptyDescription>
                      {t("table.noDataDescription")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.id")}</TableHead>
                      <TableHead>{t("table.description")}</TableHead>
                      <TableHead>{t("table.amount")}</TableHead>
                      <TableHead>{t("table.type")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                      <TableHead>{t("table.created")}</TableHead>
                      <TableHead>{t("table.actions")}</TableHead>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <IconMessageCircle className="h-4 w-4 mr-1" />
                              {t("actions.respond")}
                            </Button>
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
                    {t("pagination.rowsPerPage")}
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
                    {t("pagination.pageOf", {
                      current: currentPage,
                      total: totalPages,
                    })}
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
            <DialogTitle>{t("respondDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("respondDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.transactionId")}
                  </Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.amount")}
                  </Label>
                  <p className="font-semibold">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.transactionType")}
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
                    {t("respondDialog.status")}
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
                      {t("respondDialog.descriptionLabel")}
                    </Label>
                    <p>{selectedTransaction.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.userInquiry")}
                  </Label>
                  {transactionDetail?.userNotes &&
                  transactionDetail.userNotes.length > 0 ? (
                    <div className="space-y-2">
                      {transactionDetail.userNotes.map((note) => (
                        <div
                          key={note.id}
                          className="text-sm bg-background p-3 rounded border"
                        >
                          <p className="whitespace-pre-wrap">{note.notes}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm bg-background p-3 rounded border">
                      {t("respondDialog.noNotes")}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.createdAt")}
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("respondDialog.lastUpdated")}
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(selectedTransaction.lastUpdatedAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseNotes">
                  {t("respondDialog.responseLabel")}
                </Label>
                <Textarea
                  id="responseNotes"
                  placeholder={t("respondDialog.responsePlaceholder")}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {t("respondDialog.responseHint")}
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
              {t("respondDialog.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {t("respondDialog.updating")}
                </>
              ) : (
                t("respondDialog.update")
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
