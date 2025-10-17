"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import FeaturesList from "./pricing-featureList";

export default function FreeCard({ freeFeatures }: { freeFeatures: string[] }) {
  const t = useTranslations("pricing");
  return (
    <Card className="relative flex flex-col">
      <CardHeader className="pb-6 sm:pb-0">
        <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
          {t("freeTier.name")}
        </CardTitle>
        <div className="mt-3 sm:mt-4">
          <span className="text-3xl sm:text-3xl font-bold">
            {t("freeTier.price")}
          </span>
          <span className="text-base sm:text-lg text-muted-foreground ml-1">
            {t("freeTier.period")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
          <>&nbsp;</>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <FeaturesList items={freeFeatures} />
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          {t("freeTier.button")}
        </Button>
      </CardFooter>
    </Card>
  );
}
