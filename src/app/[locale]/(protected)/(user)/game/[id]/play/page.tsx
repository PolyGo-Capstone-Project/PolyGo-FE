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
  useInterestsQuery,
  usePlayWordsetMutation,
  useStartWordsetGameMutation,
  useWordsetDetailQuery,
  useWordsetGameStateQuery,
  useWordsetHintMutation, // 🆕 thêm hook hint
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
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [isGameCompleted, setIsGameCompleted] = useState(false);

  // ===== Lấy meta (title/desc/lang/category/...) từ detail =====
  const { data: detailRes } = useWordsetDetailQuery({
    id: wordsetId,
    lang: locale,
    enabled: Boolean(wordsetId),
  });
  const detail = detailRes?.data;

  // ===== Master interests để map category (id) -> tên =====
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });
  // const interests = interestsData?.payload?.data?.items ?? [];
  const interests = useMemo(
    () => interestsData?.payload?.data?.items ?? [],
    [interestsData?.payload?.data?.items]
  );

  const interestMap = useMemo(() => {
    const m = new Map<string, any>();
    interests.forEach((it: any) => {
      if (it?.id) m.set(it.id, it);
    });
    return m;
  }, [interests]);

  const interestLabel = useMemo(() => {
    if (!detail?.interest) return "";

    const id = detail.interest.id;
    const fallbackName = detail.interest.name ?? "";

    if (!id) return fallbackName;

    return interestMap.get(id)?.name ?? fallbackName;
  }, [detail?.interest, interestMap]);

  // ===== GAME STATE (lấy 1 lần làm baseline, KHÔNG polling) =====
  const {
    data: gameStateRes,
    refetch: refetchGameState, // 🆕 sẽ dùng khi bấm hint
  } = useWordsetGameStateQuery(wordsetId, {
    enabled: Boolean(wordsetId && hasActiveGame),
    refetchInterval: false, // ⛔ không poll
    refetchOnWindowFocus: false, // ⛔ không refetch khi focus
    refetchOnMount: false,
  });
  const gameState = gameStateRes?.data;

  // ===== START + PLAY mutations =====
  const { mutate: startGame } = useStartWordsetGameMutation({
    onSuccess: (res) => {
      const w = res.data.currentWord;
      setCurrentWord(w);
      setLetters(w.scrambledWord.split(""));
      setAnswer("");
      setHasActiveGame(true);
      setIsGameCompleted(false);
      // Đồng bộ counters khởi tạo nếu server có
      if (typeof res.data.totalWords === "number")
        setTotalLocal(res.data.totalWords);

      // Khởi tạo mốc bắt đầu cho đồng hồ (schema của bạn là startTime)
      const serverStartTs = res.data.startTime
        ? new Date(res.data.startTime).getTime()
        : Date.now();
      sessionStorage.setItem("polygo_wordset_startedAt", String(serverStartTs));
      const initElapsed = Math.max(
        0,
        Math.floor((Date.now() - serverStartTs) / 1000)
      );
      setElapsedLocal(initElapsed);
      setRunning(true);
    },
  });

  const { mutateAsync: playAnswerAsync } = usePlayWordsetMutation({
    onSuccess: (res) => {
      const d = res.data;

      // ✅ Nếu đã hoàn tất, ngừng đồng hồ và chuyển leaderboard
      if (d.isCompleted) {
        setIsGameCompleted(true);
        setRunning(false);
        setHasActiveGame(false);
        router.push(`/${locale}/game/${wordsetId}/leaderboard`);

        setTimeout(() => {
          router.push(`/${locale}/game/${wordsetId}/leaderboard`);
        }, 400);

        return;
      }

      // ✅ Chỉ đổi từ mới khi đúng
      if (d.isCorrect && d.nextWord) {
        setCurrentWord(d.nextWord);
        setLetters(d.nextWord.scrambledWord.split(""));
        setAnswer("");
      }
      // ❌ Nếu sai thì KHÔNG đổi thứ tự letters
    },
  });

  // 🆕 Mutation cho Hint
  const { mutate: hintMutation } = useWordsetHintMutation();

  // ===== local state hiển thị từ hiện tại + input =====
  const [currentWord, setCurrentWord] = useState<
    | {
        id: string;
        scrambledWord: string;
        definition: string;
        hint?: string | null;
        pronunciation?: string | null;
      }
    | undefined
  >(undefined);

  const [letters, setLetters] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [quitOpen, setQuitOpen] = useState(false);

  // ===== Đồng hồ & counters local =====
  const [elapsedLocal, setElapsedLocal] = useState(0);
  const [running, setRunning] = useState(false);

  const [completedLocal, setCompletedLocal] = useState(0);
  const [totalLocal, setTotalLocal] = useState(0);
  const [mistakesLocal, setMistakesLocal] = useState(0);
  const [hintsUsedLocal, setHintsUsedLocal] = useState(0);

  // ===== Start game ngay khi vào trang =====
  useEffect(() => {
    if (wordsetId) startGame(wordsetId);
  }, [wordsetId, startGame]);

  // ===== Khôi phục từ gameState (1 lần) & sessionStorage =====
  useEffect(() => {
    if (!gameState) return;

    if (typeof gameState.totalWords === "number")
      setTotalLocal(gameState.totalWords);
    if (typeof gameState.completedWords === "number")
      setCompletedLocal(gameState.completedWords);
    if (typeof gameState.mistakes === "number")
      setMistakesLocal(gameState.mistakes);
    if (typeof gameState.hintsUsed === "number")
      setHintsUsedLocal(gameState.hintsUsed);

    // Ưu tiên mốc startTime từ server; nếu không có, lấy từ sessionStorage
    const serverStart = gameState.startTime
      ? new Date(gameState.startTime).getTime()
      : undefined;
    if (serverStart) {
      const initElapsed = Math.max(
        0,
        Math.floor((Date.now() - serverStart) / 1000)
      );
      setElapsedLocal(initElapsed);
      sessionStorage.setItem("polygo_wordset_startedAt", String(serverStart));
      setRunning(true);
    } else {
      const ss = sessionStorage.getItem("polygo_wordset_startedAt");
      if (ss) {
        const ts = Number(ss);
        if (!Number.isNaN(ts)) {
          const initElapsed = Math.max(0, Math.floor((Date.now() - ts) / 1000));
          setElapsedLocal(initElapsed);
          setRunning(true);
        }
      }
    }
  }, [gameState]);

  // ===== Interval cho timer local =====
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedLocal((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // ===== Derived UI values từ local =====
  const completed = completedLocal;
  const total = totalLocal;
  const mistakes = mistakesLocal;
  const hintsUsed = hintsUsedLocal;
  const elapsed = elapsedLocal;

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
      return Boolean(res.payload?.data?.isCorrect);
    } catch {
      return false;
    }
  };

  // 🆕 handler khi user bấm Hint
  const handleHint = () => {
    if (!wordsetId || !currentWord) return;
    hintMutation(
      {
        wordSetId: wordsetId,
        body: { wordId: currentWord.id },
      },
      {
        // Sau khi POST thành công -> gọi lại game-state để lấy hintsUsed mới
        onSuccess: () => {
          refetchGameState();
        },
      }
    );
  };

  // Map dữ liệu cho PlayCard (lấy hint từ currentWord hoặc gameState.currentWord)
  const wordForUI =
    currentWord &&
    ((): {
      id: string;
      word: string;
      letters: string[];
      definition: string;
      hint?: string;
      pronunciation?: string;
    } => {
      const hintFromGameState = gameState?.currentWord?.hint ?? undefined;
      const pronunciationFromGameState =
        gameState?.currentWord?.pronunciation ?? undefined;

      return {
        id: currentWord.id,
        word: "", // không lộ đáp án
        letters,
        definition: currentWord.definition,
        hint: currentWord.hint ?? hintFromGameState ?? undefined,
        pronunciation:
          currentWord.pronunciation ?? pronunciationFromGameState ?? undefined,
      };
    })();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <HeaderCard
        title={detail?.title ?? t("play.title", { default: "Wordset" })}
        description={
          detail?.description ??
          t("play.description", { default: "Solve the vocabulary puzzle." })
        }
        languageLabel={detail?.language?.name ?? ""}
        category={interestLabel}
        onQuit={() => setQuitOpen(true)}
      />

      <StatsRow
        timeLabel={t("play.time", { default: "Time" })}
        timeValue={mmss(elapsed)}
        progressLabel={t("play.progress", { default: "Progress" })}
        progressValue={`${completed}/${total || 0}`}
        mistakesLabel={t("play.mistakes", { default: "Mistakes" })}
        mistakesValue={mistakes}
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
          tHint={t("play.hint", { default: "Hint" })} // dùng làm text nút Hint luôn
          tPronuciation={t("play.pronuciation", { default: "Pronuciation" })}
          tPlaceholder={t("play.typeHere", {
            default: "Type the word here...",
          })}
          tSubmit={t("play.submit", { default: "Submit Answer" })}
          tReshuffle={t("play.reshuffle", { default: "Reshuffle" })}
          answer={answer}
          setAnswer={setAnswer}
          onSubmit={submit}
          onReshuffle={reshuffle}
          onHint={handleHint} // 🆕 truyền xuống
          isCompleted={isGameCompleted}
        />
      ) : (
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
        onQuit={() => {
          setRunning(false);
          sessionStorage.removeItem("polygo_wordset_startedAt");
          router.push(`/${locale}/game`);
        }}
      />
    </div>
  );
}
