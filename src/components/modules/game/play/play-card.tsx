"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AudioLines,
  BookOpen,
  CheckCircle2,
  Info,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  tHint: string; // dùng làm label cho nút Hint
  tPronuciation: string;
  tPlaceholder: string;
  tSubmit: string;
  tReshuffle: string;
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => boolean | Promise<boolean>;
  onReshuffle: () => void;
  onHint?: () => void; // callback khi user bấm Hint
  isCompleted?: boolean; // 🆕 báo hiệu game đã kết thúc để phát sound
};

const playSound = (src: string) => {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(src);
    void audio.play();
  } catch {
    // ignore
  }
};

export default function PlayCard({
  word,
  tUnscramble,
  tDefinition,
  tPronuciation,
  tHint,
  tPlaceholder,
  tSubmit,
  tReshuffle,
  answer,
  setAnswer,
  onSubmit,
  onReshuffle,
  onHint,
  isCompleted,
}: Props) {
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);

  // 🔹 ref cho input để auto-focus
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Mỗi lần đổi sang từ mới -> ẩn hint đi + reset flash + focus input
  useEffect(() => {
    setShowHint(false);
    setFlash(null);

    // tự focus & select để user gõ luôn
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [word.id]);

  // 🔊 phát âm thanh theo trạng thái flash (đúng / sai)
  useEffect(() => {
    if (flash === "correct") {
      playSound("/sounds/correct.mp3");
    } else if (flash === "wrong") {
      playSound("/sounds/incorrect.mp3");
    }
  }, [flash]);

  // 🔊 phát âm thanh khi kết thúc game
  useEffect(() => {
    if (isCompleted) {
      playSound("/sounds/winning.mp3");
    }
  }, [isCompleted]);

  const handleSubmit = () => {
    const result = onSubmit();
    if (result instanceof Promise) {
      result.then((ok) => {
        setFlash(ok ? "correct" : "wrong");
        setTimeout(() => setFlash(null), 500);
      });
    } else {
      setFlash(result ? "correct" : "wrong");
      setTimeout(() => setFlash(null), 500);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    onHint?.();
  };

  return (
    <Card
      className={`transition-colors ${
        flash === "correct"
          ? "ring-2 ring-emerald-500"
          : flash === "wrong"
            ? "ring-2 ring-red-500"
            : ""
      }`}
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
          <AlertTitle className="font-bold">{tDefinition}</AlertTitle>
          <AlertDescription className="space-y-1">
            <div>{word.definition}</div>
          </AlertDescription>
        </Alert>

        {/* Pronunciation */}
        {word.pronunciation && (
          <Alert>
            <AudioLines className="h-4 w-4" />
            <AlertTitle className="font-semibold">{tPronuciation}</AlertTitle>
            <AlertDescription className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {word.pronunciation}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Input
          ref={inputRef} // 🔹 quan trọng: gắn ref để auto-focus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={tPlaceholder}
          className="h-11 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <div className="flex flex-col gap-3">
          {/* Hint inline block */}
          {word.hint && showHint && (
            <div
              className="rounded-md border bg-amber-50 dark:bg-amber-950/30 
                    text-amber-800 dark:text-amber-300 p-3 text-sm"
            >
              <div className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4" />
                {tHint}
              </div>
              <div className="mt-1">{word.hint}</div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Button className="flex-[2] gap-2 h-11" onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4" />
              {tSubmit}
            </Button>

            {word.hint && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2 h-11 
             bg-amber-500 hover:bg-amber-600 
             text-white font-semibold 
             shadow-md"
                onClick={handleShowHint}
              >
                <Info className="h-4 w-4" />
                {tHint}
              </Button>
            )}

            <Button
              variant="outline"
              className="flex-1 gap-2 h-11"
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
