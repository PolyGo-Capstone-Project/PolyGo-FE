"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

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

export default function PlusListDialog({
  open,
  onOpenChange,
  isLoading,
  apiPlusPlans,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isLoading: boolean;
  apiPlusPlans: any[];
  onChoose: (plan: any) => void;
}) {
  const t = useTranslations("pricing");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("plusTier.listTitle", { defaultValue: "Danh sách gói Plus" })}
          </DialogTitle>
          <DialogDescription>
            {t("plusTier.listDesc", {
              defaultValue: "Chọn một gói Plus hiện có để mua hoặc gia hạn.",
            })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-muted-foreground py-6">
            {t("loading")}
          </div>
        ) : apiPlusPlans.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">
            {t("noFeatures", { defaultValue: "No features available" })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {apiPlusPlans.map((plan: any) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {plan.name ?? plan.planType}
                  </CardTitle>
                  <div className="mt-1 text-lg text-foreground">
                    <span className="font-bold">
                      {/* ĐÃ SỬA: Sử dụng formatVnd */}
                      {formatVnd(plan.price)}
                    </span>
                    {plan.durationInDays ? (
                      <span className="ml-1">
                        {plan.durationInDays === 30
                          ? t("plusTier.period")
                          : plan.durationInDays === 365
                            ? t("plusTier.periodYearly")
                            : `/ ${plan.durationInDays} ${t("plusTier.days")}`}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <p className="text-xs text-muted-foreground min-h-[2rem]">
                    {plan.description ?? " "}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" onClick={() => onChoose(plan)}>
                    {t("plusTier.button", { defaultValue: "Nâng cấp ngay" })}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <DialogFooterUI>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buy.cancel", { defaultValue: "Đóng" })}
          </Button>
        </DialogFooterUI>
      </DialogContent>
    </Dialog>
  );
}
