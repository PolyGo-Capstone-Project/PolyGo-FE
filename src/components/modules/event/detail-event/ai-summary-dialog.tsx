"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
} from "@/components";
import { useGenerateEventSummaryMutation, useGetEventSummary } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import { VocabularyItemType } from "@/models";
import {
  IconBook2,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconListCheck,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface AISummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  isHost: boolean;
}

// Vocabulary Item Component
function VocabularyCard({
  item,
  index,
  t,
}: {
  item: VocabularyItemType;
  index: number;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
            <h4 className="font-semibold text-lg text-primary">{item.word}</h4>
          </div>
          <p className="text-sm text-foreground">{item.meaning}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {expanded ? (
            <IconChevronUp className="h-4 w-4" />
          ) : (
            <IconChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className=" border-t space-y-3">
          {item.context && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                {t("vocabulary.context")}
              </p>
              <p className="text-sm italic text-foreground/80">
                &ldquo;{item.context}&rdquo;
              </p>
            </div>
          )}
          {item.examples && item.examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                {t("vocabulary.examples")}
              </p>
              <ul className="text-sm space-y-1">
                {item.examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AISummaryDialog({
  open,
  onOpenChange,
  eventId,
  isHost,
}: AISummaryDialogProps) {
  const t = useTranslations("meeting.aiSummary");
  const tError = useTranslations("Error");

  // Fetch existing summary
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetEventSummary(eventId, { enabled: open && !!eventId });

  // Generate summary mutation
  const generateMutation = useGenerateEventSummaryMutation({
    onSuccess: () => {
      toast.success(t("success"));
      refetchSummary();
    },
    onError: (err) => handleErrorApi({ error: err, tError }),
  });

  const summary = summaryData?.payload?.data;
  const hasSummary = summary?.hasSummary ?? false;

  const handleGenerateSummary = () => {
    generateMutation.mutate(eventId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
          {/* Loading State */}
          {isLoadingSummary && (
            <div className="flex items-center justify-center ">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">{t("loading")}</span>
            </div>
          )}

          {/* No Summary Yet */}
          {!isLoadingSummary && !hasSummary && (
            <Card className="border-dashed">
              <CardContent className=" text-center">
                <IconFileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noSummary.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {isHost
                    ? t("noSummary.hostDescription")
                    : t("noSummary.guestDescription")}
                </p>
                {isHost && (
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={generateMutation.isPending}
                    className="gap-2"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        {t("generating")}
                      </>
                    ) : (
                      <>
                        <IconSparkles className="h-4 w-4" />
                        {t("generate")}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Content */}
          {!isLoadingSummary && hasSummary && summary && (
            <>
              {/* Main Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconFileText className="h-5 w-5 text-blue-500" />
                    {t("summary.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {summary.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Key Points */}
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconBulb className="h-5 w-5 text-yellow-500" />
                      {t("keyPoints.title")}
                      <Badge variant="secondary" className="ml-2">
                        {summary.keyPoints.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                            <IconCheck className="h-3 w-3 text-yellow-600" />
                          </div>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Vocabulary */}
              {summary.vocabulary && summary.vocabulary.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconBook2 className="h-5 w-5 text-purple-500" />
                      {t("vocabulary.title")}
                      <Badge variant="secondary" className="ml-2">
                        {summary.vocabulary.length} {t("vocabulary.words")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {summary.vocabulary.map((item, index) => (
                        <VocabularyCard
                          key={index}
                          item={item}
                          index={index}
                          t={t}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Items */}
              {summary.actionItems && summary.actionItems.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconListCheck className="h-5 w-5 text-green-500" />
                      {t("actionItems.title")}
                      <Badge variant="secondary" className="ml-2">
                        {summary.actionItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.actionItems.map((action, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-0.5 h-5 w-5 rounded border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-green-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {summary.createdAt && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  {t("generatedAt")}{" "}
                  {new Date(summary.createdAt).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-4 sm:gap-0">
          {/* {isHost && hasSummary && (
            <Button
              variant="default"
              onClick={handleGenerateSummary}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="h-4 w-4" />
              )}
              {t("regenerate")}
            </Button>
          )} */}
          <Button
            className="ml-4"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
