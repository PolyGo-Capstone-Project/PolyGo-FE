"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconAlertCircle,
  IconCheck,
  IconCreditCard,
  IconGift,
  IconMinus,
  IconPlus,
  IconSparkles,
  IconWallet,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod } from "@/constants";
import { useAuthMe, useGiftQuery, usePurchaseGiftMutation } from "@/hooks";
import { formatCurrency, handleErrorApi } from "@/lib/utils";

const purchaseFormSchema = z.object({
  giftId: z.string().min(1),
  quantity: z.number().min(1),
  paymentMethod: z.enum([
    PaymentMethod.SYSTEM,
    PaymentMethod.STRIPE,
    PaymentMethod.PAYPAL,
  ]),
  notes: z.string().max(500).optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

type PurchaseGiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftId: string;
  locale: string;
};

const paymentMethods = [
  {
    value: PaymentMethod.SYSTEM,
    label: "System Balance",
    icon: IconWallet,
    description: "Use your account balance",
  },
  {
    value: PaymentMethod.STRIPE,
    label: "Credit Card",
    icon: IconCreditCard,
    description: "Pay with Stripe",
  },
  {
    value: PaymentMethod.PAYPAL,
    label: "PayPal",
    icon: IconCreditCard,
    description: "Pay with PayPal",
  },
];

export function PurchaseGiftDialog({
  open,
  onOpenChange,
  giftId,
  locale,
}: PurchaseGiftDialogProps) {
  const t = useTranslations("gift.purchase");
  const tToast = useTranslations("gift.toast");
  const tError = useTranslations("Error");

  // Fetch gift details
  const { data: giftData } = useGiftQuery({ id: giftId, lang: locale });
  const { data: userData } = useAuthMe();

  const gift = giftData?.payload.data;
  const balance = userData?.payload.data.balance || 0;

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      giftId,
      quantity: 1,
      paymentMethod: PaymentMethod.SYSTEM,
      notes: "",
    },
  });

  const quantity = form.watch("quantity");
  const paymentMethod = form.watch("paymentMethod");
  const totalPrice = gift ? gift.price * quantity : 0;

  // Purchase mutation
  const purchaseMutation = usePurchaseGiftMutation(
    { lang: locale },
    {
      onSuccess: () => {
        toast.success(tToast("purchaseSuccess"));
        onOpenChange(false);
        form.reset();
      },
    }
  );

  const onSubmit = (data: PurchaseFormData) => {
    purchaseMutation.mutate(data, {
      onError: (error) => {
        handleErrorApi({ error, tError });
      },
    });
  };

  useEffect(() => {
    if (open) {
      form.setValue("giftId", giftId);
    }
  }, [open, giftId, form]);

  if (!gift) return null;

  const canAfford = balance >= totalPrice;
  const needsMoreBalance = totalPrice - balance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <IconSparkles className="h-6 w-6 text-primary" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Gift Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6"
            >
              <div className="flex items-start gap-4">
                {/* Gift Icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/20 blur-xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/20">
                    {gift.iconUrl ? (
                      <Image
                        src={gift.iconUrl}
                        alt={gift.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-contain"
                      />
                    ) : (
                      <IconGift className="h-12 w-12 text-primary" />
                    )}
                  </div>
                </div>

                {/* Gift Info */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold">{gift.name}</h3>
                  {gift.description && (
                    <p className="text-sm text-muted-foreground">
                      {gift.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(gift.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per item
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t("quantity")}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12"
                          onClick={() =>
                            field.onChange(Math.max(1, field.value - 1))
                          }
                          disabled={field.value <= 1}
                        >
                          <IconMinus className="h-5 w-5" />
                        </Button>
                        <div className="flex h-12 flex-1 items-center justify-center rounded-lg border-2 bg-muted/50 text-2xl font-bold">
                          {field.value}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12"
                          onClick={() => field.onChange(field.value + 1)}
                        >
                          <IconPlus className="h-5 w-5" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t("paymentMethod")}
                    </FormLabel>
                    <FormControl>
                      <div className="grid gap-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          const isSelected = field.value === method.value;
                          const isSystemAndInsufficient =
                            method.value === PaymentMethod.SYSTEM && !canAfford;

                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => field.onChange(method.value)}
                              disabled={isSystemAndInsufficient}
                              className={`relative flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              } ${
                                isSystemAndInsufficient
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
                            >
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{method.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                >
                                  <IconCheck className="h-4 w-4" />
                                </motion.div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("notes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("notesPlaceholder")}
                        {...field}
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 rounded-xl border-2 bg-muted/50 p-6"
            >
              <h4 className="font-semibold">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">
                    {formatCurrency(gift.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">×{quantity}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">{t("total")}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Balance Info */}
            {paymentMethod === PaymentMethod.SYSTEM && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-xl border-2 p-4 ${
                  canAfford
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  {canAfford ? (
                    <IconCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <IconAlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Balance</span>
                      <span className="font-semibold">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    {!canAfford && (
                      <p className="text-sm text-red-500">
                        You need {formatCurrency(needsMoreBalance)} more to
                        complete this purchase.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={purchaseMutation.isPending}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  purchaseMutation.isPending ||
                  (paymentMethod === PaymentMethod.SYSTEM && !canAfford)
                }
                className="flex-1 gap-2"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("purchasing")}
                  </>
                ) : (
                  <>
                    <IconSparkles className="h-5 w-5" />
                    {t("confirm")}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
