"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Progress } from "@/components/ui/progress";

// Components
import HeaderCard from "@/components/modules/game/play/header-card";
import PlayCard from "@/components/modules/game/play/play-card";
import QuitDialog from "@/components/modules/game/play/quit-dialog";
import StatsRow from "@/components/modules/game/play/stat-row";

// ✅ hooks API
import {
  usePlayWordsetMutation,
  useStartWordsetGameMutation,
  useWordsetDetailQuery,
  useWordsetGameStateQuery,
} from "@/hooks";

// --------- Helper shuffle chỉ dùng trong trang ----------
function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function PlayGamePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const wordsetId = params?.id;

  // ===== Lấy meta (title/desc/lang/category/...) từ detail =====
  const { data: detailRes } = useWordsetDetailQuery({
    id: wordsetId,
    lang: locale,
    enabled: Boolean(wordsetId),
  });
  const detail = detailRes?.data;

  // ===== GAME STATE (polling mỗi 1s để hiển thị đồng hồ, mistakes, tiến độ) =====
  const { data: gameStateRes } = useWordsetGameStateQuery(wordsetId, {
    enabled: Boolean(wordsetId),
    refetchInterval: 1000,
  });
  const gameState = gameStateRes?.data;

  // ===== START + PLAY mutations =====
  const { mutate: startGame } = useStartWordsetGameMutation({
    onSuccess: (res) => {
      const w = res.data.currentWord;
      setCurrentWord(w);
      setLetters(w.scrambledWord.split(""));
      setAnswer("");
    },
  });

  const { mutateAsync: playAnswerAsync } = usePlayWordsetMutation({
    onSuccess: (res) => {
      const d = res.data;
      if (d.isCompleted) {
        router.push(`/${locale}/game/${wordsetId}/leaderboard`);
        return;
      }
      if (d.isCorrect && d.nextWord) {
        setCurrentWord(d.nextWord);
        setLetters(d.nextWord.scrambledWord.split(""));
        setAnswer("");
      }
    },
  });

  // ===== local state hiển thị từ hiện tại + input =====
  const [currentWord, setCurrentWord] = useState<
    | {
        id: string;
        scrambledWord: string;
        definition: string;
        hint?: string | null;
      }
    | undefined
  >(undefined);

  const [letters, setLetters] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [quitOpen, setQuitOpen] = useState(false);

  // ===== Start game ngay khi vào trang =====
  useEffect(() => {
    if (wordsetId) startGame(wordsetId);
  }, [wordsetId, startGame]);

  // ===== Derived UI values từ game-state =====
  const completed = gameState?.completedWords ?? 0;
  const total = gameState?.totalWords ?? 0;
  const mistakes = gameState?.mistakes ?? 0;
  const hintsUsed = gameState?.hintsUsed ?? 0;
  const elapsed = gameState?.elapsedTime ?? 0;

  const progressPct = useMemo(() => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }, [completed, total]);

  const mmss = (s: number) => {
    const m = Math.floor(s / 60).toString();
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const reshuffle = () => {
    // chỉ đổi thứ tự hiển thị, KHÔNG đổi từ server trả về
    setLetters((prev) => shuffle(prev));
  };

  const submit = async (): Promise<boolean> => {
    if (!currentWord || !wordsetId) return false;
    try {
      const res = await playAnswerAsync({
        wordSetId: wordsetId,
        wordId: currentWord.id,
        answer: answer.trim(),
      });
      // true => flash xanh, false => flash đỏ
      return Boolean(res.payload?.data?.isCorrect);
    } catch {
      return false;
    }
  };

  // Map dữ liệu cho PlayCard
  const wordForUI =
    currentWord &&
    ({
      id: currentWord.id,
      word: "", // không lộ đáp án
      letters,
      definition: currentWord.definition,
      hint: currentWord.hint ?? undefined,
    } as const);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <HeaderCard
        title={detail?.title ?? t("play.title", { default: "Wordset" })}
        description={
          detail?.description ??
          t("play.description", { default: "Solve the vocabulary puzzle." })
        }
        languageLabel={detail?.language?.name ?? ""}
        category={detail?.category ?? ""}
        onQuit={() => setQuitOpen(true)}
      />

      <StatsRow
        timeLabel={t("play.time", { default: "Time" })}
        timeValue={mmss(elapsed)}
        progressLabel={t("play.progress", { default: "Progress" })}
        progressValue={`${completed}/${total || 0}`}
        mistakesLabel={t("play.mistakes", { default: "Mistakes" })}
        mistakesValue={mistakes}
        // Hints đã bật mặc định trong component
        hintsLabel={t("play.hintsUsed", { default: "Hints" })}
        hintsValue={hintsUsed}
      />

      <div className="space-y-2">
        <div className="text-sm font-medium">
          {t("play.progressBar", { default: "Progress" })}
        </div>
        <Progress value={progressPct} />
      </div>

      {wordForUI ? (
        <PlayCard
          word={wordForUI}
          tUnscramble={t("play.unscramble", {
            default: "Unscramble this word:",
          })}
          tDefinition={t("play.definition", { default: "Definition:" })}
          tHint={t("play.hint", { default: "Hint:" })}
          tPlaceholder={t("play.typeHere", {
            default: "Type the word here...",
          })}
          tSubmit={t("play.submit", { default: "Submit Answer" })}
          tReshuffle={t("play.reshuffle", { default: "Reshuffle" })}
          answer={answer}
          setAnswer={setAnswer}
          onSubmit={submit}
          onReshuffle={reshuffle}
        />
      ) : (
        // Trạng thái chưa có currentWord (đang start/poll)
        <div className="text-sm text-muted-foreground">
          {t("play.loading", { default: "Preparing your game..." })}
        </div>
      )}

      <QuitDialog
        open={quitOpen}
        onOpenChange={setQuitOpen}
        title={t("play.quitTitle", { default: "Quit Game?" })}
        desc={t("play.quitDesc", {
          default: "Are you sure you want to quit? Your progress will be lost.",
        })}
        progressText={`${completed}/${total || 0}`}
        wordsLabel={t("meta.words", { default: "words" })}
        continueText={t("play.continue", { default: "Continue Playing" })}
        quitText={t("play.quit", { default: "Quit Game" })}
        onQuit={() => router.push(`/${locale}/game`)}
      />
    </div>
  );
}
