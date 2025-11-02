"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SubmitPanel({
  wordCount,
  minutes,
  canSubmit,
  onBack,
  onSubmit,
}: {
  wordCount: number;
  minutes: number;
  canSubmit: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {t("create.submit.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 bg-muted/40">
          <div className="font-medium mb-2">
            {t("create.submit.reviewTitle")}
          </div>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>{t("create.submit.review1")}</li>
            <li>{t("create.submit.review2")}</li>
            <li>{t("create.submit.review3")}</li>
            <li>{t("create.submit.review4")}</li>
          </ul>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <BookOpen className="inline h-4 w-4 mr-1" />
            {wordCount} {t("meta.words")}
          </div>
          <div className="text-muted-foreground">
            <Timer className="inline h-4 w-4 mr-1" /> ~{minutes}{" "}
            {t("create.words.min")}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onBack}
          >
            {t("create.submit.cancel")}
          </Button>
          <Button
            className="w-full sm:w-auto gap-2"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            <CheckCircle2 className="h-4 w-4" />
            {t("create.submit.cta")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
