"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// shadcn/ui
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// icons (lucide via shadcn)
import {
  BookOpen,
  CheckCircle2,
  Info,
  LogOut,
  RefreshCcw,
  Target,
  Timer,
  XCircle,
} from "lucide-react";

/** ---------------- Types + Mock inside component ---------------- */
type WordItem = {
  id: string;
  word: string; // correct word
  letters: string[]; // scrambled letters
  definition: string;
  pronunciation?: string;
  hint?: string;
};

type PuzzleMeta = {
  id: string;
  title: string;
  description: string;
  languageLabel: string;
  category: string;
  level: "easy" | "medium" | "hard";
  estTimeMin: number;
  words: WordItem[];
};

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** ---------------- Page ---------------- */
export default function PlayGamePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // ==== Mock API result (swap via real fetch later) ====
  const PUZZLE: PuzzleMeta = useMemo(
    () => ({
      id: "vn-food",
      title: "Vietnamese Food Vocabulary",
      description:
        "Learn essential Vietnamese food terms and cooking vocabulary",
      languageLabel: "Vietnamese",
      category: "food",
      level: "easy",
      estTimeMin: 8,
      words: [
        {
          id: "pho",
          word: "pho",
          letters: shuffle(["P", "H", "Ơ"]),
          definition: "Traditional Vietnamese noodle soup with beef or chicken",
          pronunciation: "/fəː/",
          hint: "Vietnam's most famous dish",
        },
        {
          id: "tra",
          word: "tea",
          letters: shuffle(["T", "E", "A"]),
          definition: "A popular hot drink made by infusing dried leaves",
          hint: "Often served with milk",
        },
      ],
    }),
    []
  );

  // ==== State ====
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [quitOpen, setQuitOpen] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);

  const current = PUZZLE.words[index];
  const progress = Math.round((index / PUZZLE.words.length) * 100);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mmss = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(1, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const reshuffle = () => {
    // simple re-order only for UI feel
    current.letters = shuffle(current.letters);
    setAnswer((a) => a); // trigger render
  };

  const submit = () => {
    if (!current) return;
    if (answer.trim().toLowerCase() === current.word.toLowerCase()) {
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 600);
      if (index + 1 < PUZZLE.words.length) {
        setIndex((i) => i + 1);
        setAnswer("");
      } else {
        // finished -> navigate to leaderboard or summary
        router.push(`/${locale}/game/${PUZZLE.id}/leaderboard`);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  const useHint = () => {
    setHintsUsed((h) => h + 1);
    setAnswer(current.word[0] ?? "");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg md:text-xl">{PUZZLE.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {PUZZLE.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{PUZZLE.languageLabel}</Badge>
              <Badge variant="outline">{PUZZLE.category}</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={() => setQuitOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            {t("play.quit", { default: "Quit Game" })}
          </Button>
        </CardHeader>
      </Card>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label={t("play.time", { default: "Time" })}
          value={mmss(elapsed)}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label={t("play.progress", { default: "Progress" })}
          value={`${index}/${PUZZLE.words.length}`}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label={t("play.mistakes", { default: "Mistakes" })}
          value={mistakes}
        />
        {/* <StatCard icon={<Lightbulb className="h-5 w-5" />} label={t("play.hints", { default: "Hints Used" })} value={hintsUsed} /> */}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="text-sm font-medium">
          {t("play.progressBar", { default: "Progress" })}
        </div>
        <Progress value={progress} />
      </div>

      {/* Play card */}
      <Card
        className={`transition-colors ${correctFlash ? "ring-2 ring-emerald-500" : ""}`}
      >
        <CardHeader>
          <CardTitle className="text-center">
            {t("play.unscramble", { default: "Unscramble this word:" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Letters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {current.letters.map((ch, i) => (
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
            <AlertTitle>
              {t("play.definition", { default: "Definition:" })}
            </AlertTitle>
            <AlertDescription className="space-y-1">
              <div>{current.definition}</div>
              {current.pronunciation && (
                <div className="text-xs text-muted-foreground">
                  {current.pronunciation}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Hint (toggle by clicking) */}
          {current.hint && (
            <div className="rounded-md border bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4" />
                {t("play.hint", { default: "Hint:" })}
              </div>
              <div className="mt-1">{current.hint}</div>
            </div>
          )}

          {/* Answer box */}
          <div className="max-w-xl mx-auto">
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("play.typeHere", {
                default: "Type the word here...",
              })}
              className="h-11 text-base"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button className="gap-2 flex-1" onClick={submit}>
                <CheckCircle2 className="h-4 w-4" />
                {t("play.submit", { default: "Submit Answer" })}
              </Button>
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={reshuffle}
              >
                <RefreshCcw className="h-4 w-4" />
                {t("play.reshuffle", { default: "Reshuffle" })}
              </Button>
            </div>
            <div className="mt-2">
              {/* <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={useHint}>
                + {t("play.useHint", { default: "Use a hint" })}
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quit dialog */}
      <Dialog open={quitOpen} onOpenChange={setQuitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("play.quitTitle", { default: "Quit Game?" })}
            </DialogTitle>
            <DialogDescription>
              {t("play.quitDesc", {
                default:
                  "Are you sure you want to quit? Your progress will be lost.",
              })}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="text-sm text-muted-foreground">
            {t("play.currentProgress", { default: "Current progress:" })}{" "}
            {index}/{PUZZLE.words.length}{" "}
            {t("meta.words", { default: "words" })}{" "}
            {t("play.completed", { default: "completed" })}
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setQuitOpen(false)}>
              {t("play.continue", { default: "Continue Playing" })}
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push(`/${locale}/game`)}
            >
              {t("play.quit", { default: "Quit Game" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold mt-1">{value}</div>
        </div>
        <div className="opacity-80">{icon}</div>
      </CardContent>
    </Card>
  );
}
