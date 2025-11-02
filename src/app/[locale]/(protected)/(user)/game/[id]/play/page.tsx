"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Progress } from "@/components/ui/progress";

// Components (đã tách)
import HeaderCard from "@/components/modules/game/play/header-card";
import PlayCard from "@/components/modules/game/play/play-card";
import QuitDialog from "@/components/modules/game/play/quit-dialog";
import StatsRow from "@/components/modules/game/play/stat-row";

// --------- Kiểu dữ liệu dùng riêng trang ----------
type WordItem = {
  id: string;
  word: string;
  letters: string[];
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

// --------- Helper shuffle chỉ dùng trong trang ----------
function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function PlayGamePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // ===== Mock API (đặt ngay tại nơi sử dụng) =====
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
          id: "tea",
          word: "tea",
          letters: shuffle(["T", "E", "A"]),
          definition: "A popular hot drink made by infusing dried leaves",
          hint: "Often served with milk",
        },
      ],
    }),
    []
  );

  // ===== State =====
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [quitOpen, setQuitOpen] = useState(false);

  const current = PUZZLE.words[index];
  const progress = Math.round((index / PUZZLE.words.length) * 100);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mmss = (s: number) => {
    const m = Math.floor(s / 60).toString();
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const reshuffle = () => {
    // re-order letters — chỉ để tăng cảm giác chơi
    current.letters = shuffle(current.letters);
    setAnswer((a) => a); // trigger re-render
  };

  const submit = () => {
    if (!current) return;
    if (answer.trim().toLowerCase() === current.word.toLowerCase()) {
      if (index + 1 < PUZZLE.words.length) {
        setIndex((i) => i + 1);
        setAnswer("");
      } else {
        router.push(`/${locale}/game/${PUZZLE.id}/leaderboard`);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <HeaderCard
        title={PUZZLE.title}
        description={PUZZLE.description}
        languageLabel={PUZZLE.languageLabel}
        category={PUZZLE.category}
        onQuit={() => setQuitOpen(true)}
      />

      <StatsRow
        timeLabel={t("play.time", { default: "Time" })}
        timeValue={mmss(elapsed)}
        progressLabel={t("play.progress", { default: "Progress" })}
        progressValue={`${index}/${PUZZLE.words.length}`}
        mistakesLabel={t("play.mistakes", { default: "Mistakes" })}
        mistakesValue={mistakes}
        // Nếu muốn hiển thị hints: truyền thêm props
        // hintsLabel={t("play.hintsUsed", { default: "Hints Used" })}
        // hintsValue={hintsUsed}
      />

      <div className="space-y-2">
        <div className="text-sm font-medium">
          {t("play.progressBar", { default: "Progress" })}
        </div>
        <Progress value={progress} />
      </div>

      <PlayCard
        word={current}
        tUnscramble={t("play.unscramble", { default: "Unscramble this word:" })}
        tDefinition={t("play.definition", { default: "Definition:" })}
        tHint={t("play.hint", { default: "Hint:" })}
        tPlaceholder={t("play.typeHere", { default: "Type the word here..." })}
        tSubmit={t("play.submit", { default: "Submit Answer" })}
        tReshuffle={t("play.reshuffle", { default: "Reshuffle" })}
        answer={answer}
        setAnswer={setAnswer}
        onSubmit={submit}
        onReshuffle={reshuffle}
      />

      <QuitDialog
        open={quitOpen}
        onOpenChange={setQuitOpen}
        title={t("play.quitTitle", { default: "Quit Game?" })}
        desc={t("play.quitDesc", {
          default: "Are you sure you want to quit? Your progress will be lost.",
        })}
        progressText={`${index}/${PUZZLE.words.length}`}
        wordsLabel={t("meta.words", { default: "words" })}
        continueText={t("play.continue", { default: "Continue Playing" })}
        quitText={t("play.quit", { default: "Quit Game" })}
        onQuit={() => router.push(`/${locale}/game`)}
      />
    </div>
  );
}
