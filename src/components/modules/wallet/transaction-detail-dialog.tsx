"use client";

import { format } from "date-fns";
import Image from "next/image";

import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Separator,
  Spinner,
} from "@/components/ui";
import { useTransactionDetail } from "@/hooks";
import { useTranslations } from "next-intl";

interface TransactionDetailDialogProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailDialog({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailDialogProps) {
  const t = useTranslations("wallet.transactions");
  const { data, isLoading } = useTransactionDetail({
    id: transactionId,
    enabled: open && !!transactionId,
  });

  const transaction = data?.payload?.data;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("detailDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("receiptDialog.transactionId")}: {transactionId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : transaction ? (
          <div className="space-y-6">
            {/* Transaction Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Transaction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="font-mono text-sm break-all">
                    {transaction.id}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Amount
                  </Label>
                  <p className="font-semibold text-lg">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Remaining Balance
                  </Label>
                  <p className="font-semibold">
                    {formatCurrency(transaction.remainingBalance)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Transaction Type
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getTypeBadgeVariant(transaction.transactionType)}
                    >
                      {transaction.transactionType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("columns.method")}
                  </Label>
                  <p>{transaction.transactionMethod}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getStatusBadgeVariant(
                        transaction.transactionStatus
                      )}
                    >
                      {transaction.transactionStatus}
                    </Badge>
                  </div>
                </div>
                {transaction.description && (
                  <div className="col-span-full">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm mt-1">{transaction.description}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Created At
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(transaction.lastUpdatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Information (if available) */}
            {(transaction.bankName ||
              transaction.bankNumber ||
              transaction.accountName) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Bank Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    {transaction.bankName && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Bank Name
                        </Label>
                        <p>{transaction.bankName}</p>
                      </div>
                    )}
                    {transaction.bankNumber && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Bank Number
                        </Label>
                        <p className="font-mono">{transaction.bankNumber}</p>
                      </div>
                    )}
                    {transaction.accountName && (
                      <div className="col-span-full">
                        <Label className="text-xs text-muted-foreground">
                          Account Name
                        </Label>
                        <p>{transaction.accountName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Withdrawal Receipt (if available) */}
            {transaction.withdrawalApprovedImageUrl && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {t("detailDialog.withdrawalReceipt")}
                  </h3>
                  <div className="rounded-lg border overflow-hidden">
                    <Image
                      src={transaction.withdrawalApprovedImageUrl}
                      alt="Withdrawal receipt"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Inquiry Information (if userNotes exist) */}
            {transaction.userNotes && transaction.userNotes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {t("detailDialog.inquiryInformation")}
                  </h3>
                  <div className="space-y-3">
                    {transaction.userNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 bg-muted rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Note
                            </Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {note.notes}
                            </p>
                          </div>
                          <div className="text-right">
                            <Label className="text-xs text-muted-foreground">
                              Date
                            </Label>
                            <p className="text-xs mt-1">
                              {formatDateTime(note.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Inquiry Badge */}
            {transaction.isInquiry && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Badge variant="destructive">Inquiry</Badge>
                <span className="text-sm text-muted-foreground">
                  This transaction has an inquiry request
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Transaction not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
