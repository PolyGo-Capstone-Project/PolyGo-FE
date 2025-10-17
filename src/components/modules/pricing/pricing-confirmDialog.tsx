"use client";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// Hàm định dạng tiền tệ Việt Nam
const formatVnd = (amount: number | string | null | undefined) => {
  if (amount == null) return "—";
  const num = Number(amount);
  if (isNaN(num)) return amount;

  // Sử dụng Intl.NumberFormat để định dạng VNĐ chuẩn
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0, // Bỏ số thập phân nếu không cần
  }).format(num);
};

export default function ConfirmBuyDialog({
  open,
  onOpenChange,
  selectedPlan,
  autoRenew,
  setAutoRenew,
  isPending,
  onConfirm, // legacy
  onConfirmAsync, // ✅ Mới: dùng để biết kết quả và redirect
  thankyouPath = "/thankyou", // ✅ Mới: path trang cảm ơn
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedPlan: any;
  autoRenew: boolean;
  setAutoRenew: (v: boolean) => void;
  isPending: boolean;
  onConfirm: () => void; // legacy
  onConfirmAsync?: () => Promise<boolean>; // ✅ mới
  thankyouPath?: string; // ✅ mới
}) {
  const t = useTranslations("pricing");
  const router = useRouter();
  const locale = useLocale();

  const handleConfirm = async () => {
    // Nếu có onConfirmAsync (mới) -> đợi kết quả để điều hướng
    if (onConfirmAsync) {
      const ok = await onConfirmAsync();
      if (ok) {
        // ĐÃ SỬA LỖI CÚ PHÁP REDIRECT
        router.push(`/${locale}${thankyouPath}`);
        onOpenChange(false); // Đóng dialog sau khi chuyển trang thành công
      }
      return;
    } // Fallback cũ: gọi onConfirm và … (không biết kết quả), KHÔNG redirect
    onConfirm?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("buy.confirmTitle", { defaultValue: "Xác nhận mua gói" })}
          </DialogTitle>
          <DialogDescription>
            {t("buy.desc", {
              defaultValue:
                "Vui lòng kiểm tra thông tin gói trước khi xác nhận.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {t("planName", { defaultValue: "Tên gói" })}
            </span>
            <span className="text-sm font-semibold">
              {selectedPlan?.name ?? selectedPlan?.planType ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {t("price", { defaultValue: "Giá" })}
            </span>
            <span className="text-sm font-semibold">
              {/* ĐÃ SỬA: Sử dụng formatVnd */}
              {formatVnd(selectedPlan?.price)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {t("duration", { defaultValue: "Thời hạn" })}
            </span>
            <span className="text-sm font-semibold">
              {selectedPlan?.durationInDays
                ? selectedPlan.durationInDays === 30
                  ? t("plusTier.period", { defaultValue: "tháng" })
                  : selectedPlan.durationInDays === 365
                    ? t("plusTier.periodYearly", { defaultValue: "năm" })
                    : `${selectedPlan.durationInDays} ${t("plusTier.days")}`
                : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex flex-col">
              <Label htmlFor="auto-renew" className="text-sm font-medium">
                {t("current.autoRenew", { defaultValue: "Tự động gia hạn" })}
              </Label>
              <span className="text-xs text-muted-foreground">
                {t("buy.autoRenewHint", {
                  defaultValue: "Hệ thống sẽ tự động gia hạn khi đến hạn.",
                })}
              </span>
            </div>
            <Switch
              id="auto-renew"
              checked={autoRenew}
              onCheckedChange={setAutoRenew}
            />
          </div>
        </div>

        <DialogFooterUI className="gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("buy.cancel", { defaultValue: "Đóng" })}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlan?.id || isPending}
          >
            {isPending
              ? t("buy.processing", { defaultValue: "Đang xử lý..." })
              : t("buy.confirm", { defaultValue: "Xác nhận mua" })}
          </Button>
        </DialogFooterUI>
      </DialogContent>
    </Dialog>
  );
}
