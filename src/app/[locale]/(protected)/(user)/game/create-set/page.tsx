"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, X } from "lucide-react";

import BasicInfo from "@/components/modules/game/create-set/basic-info";
import CatDiff from "@/components/modules/game/create-set/categories-difficult";
import CreateHeader from "@/components/modules/game/create-set/create-header";
import SubmitPanel from "@/components/modules/game/create-set/submit-panel";
import WordsEditor from "@/components/modules/game/create-set/word-editor";

/* ===== helpers (chung) ===== */
type Difficulty = "easy" | "medium" | "hard";
const estimateMinutes = (vocabCount: number, difficulty: Difficulty) => {
  const base = 2,
    per = 1,
    diff = difficulty === "easy" ? 0 : difficulty === "medium" ? 2 : 4;
  return base + per * vocabCount + diff;
};

export default function CreateWordPuzzleSetPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // form state (tối giản – child components own their types & mock)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // BasicInfo
  const [languageCode, setLanguageCode] = useState<string | null>("en");

  // CatDiff
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [autoEstimate, setAutoEstimate] = useState(true);
  const [estimatedMin, setEstimatedMin] = useState<number>(5);

  // Words
  const [vocabs, setVocabs] = useState<any[]>([]);
  const wordCount = vocabs.length;

  // computed minutes (dựa trên vocabCount & difficulty)
  const computedMin = useMemo(
    () => estimateMinutes(wordCount, difficulty),
    [wordCount, difficulty]
  );
  const displayMinutes = autoEstimate ? computedMin : estimatedMin;

  const canSubmit = Boolean(
    title.trim() &&
      description.trim() &&
      languageCode &&
      categoryId &&
      wordCount > 0
  );

  // dialog
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = () => {
    // mock payload (map API sau)
    const payload = {
      title,
      description,
      language: languageCode,
      category: categoryId,
      difficulty,
      estimatedMinutes: displayMinutes,
      words: vocabs,
    };
    console.log("SUBMIT:", payload);
    setOpenDialog(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <CreateHeader />

      <BasicInfo
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        languageCode={languageCode}
        onLanguageChange={setLanguageCode}
      />

      <CatDiff
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        autoEstimate={autoEstimate}
        onAutoEstimateChange={setAutoEstimate}
        estimatedMin={estimatedMin}
        onEstimatedMinChange={setEstimatedMin}
        vocabCount={wordCount}
      />

      <WordsEditor minutes={displayMinutes} onChange={setVocabs} />

      <SubmitPanel
        wordCount={wordCount}
        minutes={displayMinutes}
        canSubmit={canSubmit}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
      />

      {/* Success Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("create.success.title")}</DialogTitle>
            <DialogDescription>{t("create.success.desc")}</DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t("create.success.status")}
            </div>
            <div>{t("create.success.eta")}</div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t("create.success.close")}
            </Button>
            <Button onClick={() => router.push(`/${locale}/game/my-sets`)}>
              {t("create.success.goto")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
