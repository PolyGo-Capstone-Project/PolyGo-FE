"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, CheckCircle2, Info, RefreshCcw } from "lucide-react";
import { useState } from "react";

type WordUI = {
  id: string;
  word: string;
  letters: string[];
  definition: string;
  pronunciation?: string;
  hint?: string;
};

type Props = {
  word: WordUI;
  tUnscramble: string;
  tDefinition: string;
  tHint: string;
  tPlaceholder: string;
  tSubmit: string;
  tReshuffle: string;
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  onReshuffle: () => void;
};

export default function PlayCard({
  word,
  tUnscramble,
  tDefinition,
  tHint,
  tPlaceholder,
  tSubmit,
  tReshuffle,
  answer,
  setAnswer,
  onSubmit,
  onReshuffle,
}: Props) {
  const [flash, setFlash] = useState(false);

  return (
    <Card
      className={`transition-colors ${flash ? "ring-2 ring-emerald-500" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-center">{tUnscramble}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Letters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {word.letters.map((ch, i) => (
            <div
              key={`${ch}-${i}`}
              className="px-4 py-2 rounded-lg border bg-card font-semibold text-lg"
            >
              {ch}
            </div>
          ))}
        </div>

        {/* Definition */}
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertTitle>{tDefinition}</AlertTitle>
          <AlertDescription className="space-y-1">
            <div>{word.definition}</div>
            {word.pronunciation && (
              <div className="text-xs text-muted-foreground">
                {word.pronunciation}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Hint */}
        {word.hint && (
          <div className="rounded-md border bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Info className="h-4 w-4" />
              {tHint}
            </div>
            <div className="mt-1">{word.hint}</div>
          </div>
        )}

        {/* Answer */}
        <div className="max-w-xl mx-auto">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={tPlaceholder}
            className="h-11 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFlash(true);
                setTimeout(() => setFlash(false), 500);
                onSubmit();
              }
            }}
          />
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Button
              className="gap-2 flex-1"
              onClick={() => {
                setFlash(true);
                setTimeout(() => setFlash(false), 500);
                onSubmit();
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              {tSubmit}
            </Button>
            <Button
              variant="outline"
              className="gap-2 flex-1"
              onClick={onReshuffle}
            >
              <RefreshCcw className="h-4 w-4" />
              {tReshuffle}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
