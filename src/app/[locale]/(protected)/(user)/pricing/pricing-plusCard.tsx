"use client";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import FeaturesList from "./pricing-featureList";

export default function PlusCard({
  plusFeatures,
  onOpenList,
}: {
  plusFeatures: string[];
  onOpenList: () => void;
}) {
  const t = useTranslations("pricing");
  return (
    <Card className="relative flex flex-col border-primary shadow-lg">
      <Badge className="absolute -top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs sm:text-sm">
        {t("mostPopular")}
      </Badge>
      <CardHeader className="pb-6 sm:pb-0">
        <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
          {t("plusTier.name")}
        </CardTitle>
        <div className="mt-3 sm:mt-4">
          <span className="text-3xl sm:text-3xl font-bold">
            {t("plusTier.price")}
          </span>
          <span className="text-base sm:text-lg text-muted-foreground ml-1">
            {t("plusTier.period")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
          <>&nbsp;</>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <FeaturesList items={plusFeatures} />
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onOpenList}>
          {t("plusTier.listButton", { defaultValue: "Danh sách gói Plus" })}
        </Button>
      </CardFooter>
    </Card>
  );
}
