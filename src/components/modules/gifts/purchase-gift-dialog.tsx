"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconGift } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod } from "@/constants";
import { useAuthMe, useGiftQuery, usePurchaseGiftMutation } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import Image from "next/image";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Gift Preview */}
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {gift.iconUrl ? (
                  <Image
                    src={gift.iconUrl}
                    alt={gift.name}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <IconGift className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{gift.name}</h4>
                {gift.description && (
                  <p className="text-sm text-muted-foreground">
                    {gift.description}
                  </p>
                )}
                <p className="mt-1 text-sm font-medium">{gift.price} PC</p>
              </div>
            </div>

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("quantity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentMethod")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.SYSTEM}>
                        System Balance
                      </SelectItem>
                      <SelectItem value={PaymentMethod.STRIPE}>
                        Stripe
                      </SelectItem>
                      <SelectItem value={PaymentMethod.PAYPAL}>
                        PayPal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="font-semibold">{t("total")}</span>
              <span className="text-lg font-bold">{totalPrice} PC</span>
            </div>

            {/* Balance Warning */}
            {!canAfford && (
              <p className="text-sm text-destructive">
                Insufficient balance. Your balance: {balance} PC
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={purchaseMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={purchaseMutation.isPending || !canAfford}
              >
                {purchaseMutation.isPending ? t("purchasing") : t("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
