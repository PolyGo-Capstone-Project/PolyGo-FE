"use client";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import { useTranslations } from "next-intl";

export default function CurrentPlanSummary({
  isLoading,
  subData,
  formatDate,
}: {
  isLoading: boolean;
  subData: any;
  formatDate: (iso?: string | null) => string;
}) {
  const t = useTranslations("pricing");
  return (
    <div className="mb-8 sm:mb-10">
      <Card className="border-primary/30">
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="flex flex-wrap items-center font-semibold gap-3 text-base sm:text-lg">
            {t("current.title", { defaultValue: "Gói hiện tại" })}
            {isLoading ? null : subData?.active ? (
              <Badge className="rounded-full px-2 py-0.5 text-xs">
                {t("current.active", { defaultValue: "Đang hoạt động" })}
              </Badge>
            ) : subData ? (
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-xs"
              >
                {t("current.inactive", { defaultValue: "Không hoạt động" })}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 sm:py-5">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              {t("current.loading", {
                defaultValue: "Đang tải gói hiện tại...",
              })}
            </div>
          ) : subData ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground">
                  {t("current.plan", { defaultValue: "Gói" })}:
                </span>
                <span className="text-lg font-semibold">
                  {subData.planName}
                </span>
                {subData.planType && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-0.5 text-[10px] background-primary text-primary"
                  >
                    {subData.planType}
                  </Badge>
                )}
              </div>
              <div className="text-md sm:text-sm text-muted-foreground">
                {t("current.ends", { defaultValue: "Kết thúc" })}:{" "}
                <span className="font-medium text-foreground">
                  {formatDate(subData.endAt)}
                </span>
                <Separator
                  className="inline-block mx-3 h-4 align-middle"
                  orientation="vertical"
                />
                {t("current.autoRenew", { defaultValue: "Tự động gia hạn" })}:{" "}
                <Badge
                  variant={subData.autoRenew ? "default" : "secondary"}
                  className="align-middle px-2 mx-2"
                >
                  {subData.autoRenew
                    ? t("current.yes", { defaultValue: "Có" })
                    : t("current.no", { defaultValue: "Không" })}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("current.empty", {
                defaultValue: "Bạn hiện không có gói đăng ký nào.",
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
