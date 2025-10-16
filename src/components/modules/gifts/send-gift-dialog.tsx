"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconGift, IconShoppingBag } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components";
import { useMyPurchasedGiftsQuery, usePresentGiftMutation } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import Image from "next/image";

const presentFormSchema = z.object({
  receiverId: z.string().min(1),
  giftId: z.string().min(1),
  quantity: z.number().min(1),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean(),
});

type PresentFormData = z.infer<typeof presentFormSchema>;

type SendGiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverName: string;
  locale: string;
};

export function SendGiftDialog({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  locale,
}: SendGiftDialogProps) {
  const t = useTranslations("gift.present");
  const tToast = useTranslations("gift.toast");
  const tError = useTranslations("Error");
  const router = useRouter();

  // Fetch purchased gifts
  const { data: purchasedGiftsData } = useMyPurchasedGiftsQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 100 },
  });

  const purchasedGifts = purchasedGiftsData?.payload.data.items || [];

  const form = useForm<PresentFormData>({
    resolver: zodResolver(presentFormSchema),
    defaultValues: {
      receiverId,
      giftId: "",
      quantity: 1,
      message: "",
      isAnonymous: false,
    },
  });

  const selectedGiftId = form.watch("giftId");
  const selectedGift = purchasedGifts.find((g) => g.id === selectedGiftId);
  const maxQuantity = selectedGift?.quantity || 0;

  // Present mutation
  const presentMutation = usePresentGiftMutation(
    { lang: locale },
    {
      onSuccess: () => {
        toast.success(tToast("presentSuccess"));
        onOpenChange(false);
        form.reset();
      },
    }
  );

  const onSubmit = (data: PresentFormData) => {
    presentMutation.mutate(data, {
      onError: (error) => {
        handleErrorApi({ error, tError });
      },
    });
  };

  const handleBuyMoreGifts = () => {
    router.push(`/${locale}/gifts`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            Sending to: <strong>{receiverName}</strong>
          </DialogDescription>
        </DialogHeader>

        {purchasedGifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <IconShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              {t("noGifts")}
            </p>
            <Button onClick={handleBuyMoreGifts}>
              <IconGift className="mr-2 h-4 w-4" />
              {t("buyMore")}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Select Gift */}
              <FormField
                control={form.control}
                name="giftId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("selectGift")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectGift")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchasedGifts.map((gift) => (
                          <SelectItem key={gift.id} value={gift.id}>
                            <div className="flex items-center gap-2">
                              {gift.iconUrl && (
                                <div className="relative h-5 w-5 shrink-0 overflow-hidden">
                                  <Image
                                    src={gift.iconUrl}
                                    alt={gift.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}
                              <span>
                                {gift.name} ({t("available")}: {gift.quantity})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              {selectedGift && (
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
                          max={maxQuantity}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Max: {maxQuantity} {t("available").toLowerCase()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("message")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("messagePlaceholder")}
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Anonymous */}
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("anonymous")}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Buy More Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBuyMoreGifts}
              >
                <IconShoppingBag className="mr-2 h-4 w-4" />
                {t("buyMore")}
              </Button>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={presentMutation.isPending}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={presentMutation.isPending || !selectedGift}
                >
                  {presentMutation.isPending ? t("sending") : t("confirm")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
