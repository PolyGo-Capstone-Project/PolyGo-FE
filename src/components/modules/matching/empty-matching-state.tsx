"use client";

import { IconReload, IconUserOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmptyMatchingStateProps = {
  onClearFilters?: () => void;
  hasFilters?: boolean;
};

export function EmptyMatchingState({
  onClearFilters,
  hasFilters = false,
}: EmptyMatchingStateProps) {
  const t = useTranslations("matching.empty");

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <IconUserOff className="h-10 w-10 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <IconReload className="mr-2 h-4 w-4" />
            {t("noResults")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
