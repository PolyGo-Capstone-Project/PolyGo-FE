"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BadgeQuestionMarkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function HowToPlay() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/70 dark:bg-violet-950/30">
      <Collapsible open={open} onOpenChange={setOpen}>
        {!open && (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 py-3 text-left text-base md:text-lg"
            >
              <span className="flex items-center gap-4">
                <BadgeQuestionMarkIcon className="h-5 w-5" />
                {t("wordPuzzle.areYouNew", {
                  default: "Are you a new player?",
                })}
              </span>
              <ChevronDown className="h-5 w-5" />
            </Button>
          </CollapsibleTrigger>
        )}

        <CollapsibleContent>
          <CardHeader className="pt-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">
                {t("wordPuzzle.howToPlay", {
                  default: "How to Play Word Puzzle",
                })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close help"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-7">
            <div>
              <div className="font-medium mb-1">
                {t("wordPuzzle.rules", { default: "Rules:" })}
              </div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t("wordPuzzle.rule.chooseSet")}</li>
                <li>{t("wordPuzzle.rule.scramble")}</li>
                <li>{t("wordPuzzle.rule.typeAndNext")}</li>
                <li>{t("wordPuzzle.rule.finishAll")}</li>
                <li>{t("wordPuzzle.rule.timeRecorded")}</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1">
                {t("wordPuzzle.scoring", { default: "Scoring:" })}
              </div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t("wordPuzzle.score.bestRank")}</li>
                <li>{t("wordPuzzle.score.perSet")}</li>
                <li>{t("wordPuzzle.score.replay")}</li>
                <li>{t("wordPuzzle.score.getXP")}</li>
                <li>{t("wordPuzzle.score.unlockBadges")}</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
