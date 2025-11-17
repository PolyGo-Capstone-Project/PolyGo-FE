"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChevronsUpDown,
  Info,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  WithdrawalRequestBodySchema,
  WithdrawalRequestBodyType,
} from "@/models";

interface WithdrawFormProps {
  onSubmit: (data: WithdrawalRequestBodyType) => void;
  balance: number;
  withdrawTimes: number;
  nextWithdrawResetAt: string | null;
  accounts: Array<{
    bankName: string;
    bankNumber: string;
    accountName: string;
  }>;
  isSubmitting?: boolean;
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForWithdraw = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translateWithdrawError = (
  issue: ZodIssueForWithdraw,
  t: Translator
): string => {
  const field = issue.path?.[0];

  if (typeof field !== "string") {
    return t("default");
  }

  switch (field) {
    case "amount": {
      if (issue.code === "invalid_type") {
        return t("amount.required");
      }
      if (issue.code === "too_small") {
        return t("amount.min");
      }
      if (issue.code === "too_big") {
        return t("amount.max");
      }
      break;
    }
    case "bankNumber": {
      if (issue.code === "invalid_type" || issue.code === "too_small") {
        return t("bankNumber.required");
      }
      break;
    }
    case "bankName": {
      if (issue.code === "invalid_type" || issue.code === "too_small") {
        return t("bankName.required");
      }
      break;
    }
    case "accountName": {
      if (issue.code === "invalid_type" || issue.code === "too_small") {
        return t("accountName.required");
      }
      break;
    }
    default:
      break;
  }

  return t("default");
};

export function WithdrawForm({
  onSubmit,
  balance,
  withdrawTimes,
  nextWithdrawResetAt,
  accounts,
  isSubmitting = false,
}: WithdrawFormProps) {
  const t = useTranslations("wallet.withdraw");
  const errorMessages = useTranslations("wallet.withdraw.errors");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const canWithdraw = withdrawTimes < 2;
  const hasAccounts = accounts.length > 0;

  const resolver = useMemo(
    () =>
      zodResolver(WithdrawalRequestBodySchema, {
        error: (issue) => ({
          message: translateWithdrawError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const form = useForm<WithdrawalRequestBodyType>({
    resolver,
    defaultValues: {
      amount: 0,
      bankName: "",
      bankNumber: "",
      accountName: "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = (data: WithdrawalRequestBodyType) => {
    onSubmit(data);
  };

  const handleSelectAccount = (account: (typeof accounts)[0]) => {
    form.setValue("bankName", account.bankName);
    form.setValue("bankNumber", account.bankNumber);
    form.setValue("accountName", account.accountName);
    setComboboxOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t("form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Info */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.availableBalance")}
            </span>
            <span className="text-lg font-bold">{formatCurrency(balance)}</span>
          </div>
        </div>

        {/* Withdraw Times Warning */}
        {!canWithdraw && nextWithdrawResetAt && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("form.limitReached", {
                date: formatDate(nextWithdrawResetAt),
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* No Bank Account Warning */}
        {!hasAccounts && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{t("form.noAccounts")}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Bank Account Selection */}
            <FormField
              control={form.control}
              name="bankNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("form.selectAccount")}</FormLabel>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!hasAccounts}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <span className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {
                                accounts.find(
                                  (acc) => acc.bankNumber === field.value
                                )?.bankName
                              }{" "}
                              - {field.value}
                            </span>
                          ) : (
                            t("form.selectAccountPlaceholder")
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <ScrollArea className="max-h-[200px]">
                        <div className="p-1">
                          {accounts.map((account) => (
                            <Button
                              key={account.bankNumber}
                              variant="ghost"
                              className="w-full justify-start text-left font-normal"
                              onClick={() => handleSelectAccount(account)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === account.bankNumber
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {account.bankName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {account.accountName} - {account.bankNumber}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t("form.selectAccountHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.amount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={10000}
                      min={10000}
                      max={balance}
                      placeholder="10,000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.amountHint", {
                      min: formatCurrency(10000),
                      max: formatCurrency(10000000),
                    })}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!canWithdraw || !hasAccounts || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("form.submitting")}
                </>
              ) : (
                <>
                  {t("form.submit")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
