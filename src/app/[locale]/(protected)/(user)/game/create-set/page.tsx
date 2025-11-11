"use client";

import BasicInfo from "@/components/modules/game/create-set/basic-info";
import CatDiff from "@/components/modules/game/create-set/categories-difficult";
import CreateHeader from "@/components/modules/game/create-set/create-header";
import SubmitPanel from "@/components/modules/game/create-set/submit-panel";
import WordsEditor from "@/components/modules/game/create-set/word-editor";
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
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useCreateWordsetMutation } from "@/hooks"; // tạo như đã hướng dẫn
import {
  CreateWordsetBodyType,
  WordsetCategory,
  WordsetDifficulty,
} from "@/models";

/* ===== helpers ===== */
const estimateMinutes = (vocabCount: number, difficulty: WordsetDifficulty) => {
  const base = 2,
    per = 1,
    diff = difficulty === "Easy" ? 0 : difficulty === "Medium" ? 2 : 4;
  return base + per * vocabCount + diff;
};

type Vocab = {
  id: string;
  word: string;
  pronunciation?: string;
  definition: string;
  hint?: string;
  imageUrl?: string;
};

export default function CreateWordPuzzleSetPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // BasicInfo -> chọn từ API: languageId
  const [languageId, setLanguageId] = useState<string | null>(null);

  // CatDiff -> enum-driven
  const [category, setCategory] = useState<WordsetCategory | null>(null);
  const [difficulty, setDifficulty] = useState<WordsetDifficulty>("Easy");

  const [autoEstimate, setAutoEstimate] = useState(true);
  const [estimatedMin, setEstimatedMin] = useState<number>(5);

  // Words
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const wordCount = vocabs.length;

  // computed
  const computedMin = useMemo(
    () => estimateMinutes(wordCount, difficulty),
    [wordCount, difficulty]
  );
  const displayMinutes = autoEstimate ? computedMin : estimatedMin;

  // validation
  const minWordsOk = wordCount >= 5;
  const allWordsValid = useMemo(
    () => vocabs.every((v) => v.word.trim() && v.definition.trim()),
    [vocabs]
  );

  const canSubmit = Boolean(
    title.trim() &&
      description.trim() &&
      languageId &&
      category &&
      minWordsOk &&
      allWordsValid
  );

  // post api
  const createWordsetMutation = useCreateWordsetMutation();
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async () => {
    if (!canSubmit || createWordsetMutation.isPending) return;

    const payload: CreateWordsetBodyType = {
      title: title.trim(),
      description: description.trim(),
      languageId: languageId as string,
      category: category as WordsetCategory, // enum value: "Food", ...
      difficulty: difficulty as WordsetDifficulty, // enum value: "Easy" | "Medium" | "Hard"
      words: vocabs.map((v) => ({
        word: v.word.trim(),
        definition: v.definition.trim(),
        hint: v.hint?.trim() || undefined,
        pronunciation: v.pronunciation?.trim() || undefined,
        imageUrl: v.imageUrl || undefined,
      })),
    };

    try {
      const res = await createWordsetMutation.mutateAsync(payload);
      const msg = res?.payload?.message || t("create.success.toast");
      toast.success(msg);
      setOpenDialog(true);
    } catch (err: any) {
      const msg =
        err?.payload?.message ||
        err?.message ||
        t("Error.default", { default: "Something went wrong" });
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <CreateHeader />

      <BasicInfo
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        languageId={languageId}
        onLanguageChange={setLanguageId}
      />

      <CatDiff
        category={category}
        onCategoryChange={setCategory}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        autoEstimate={autoEstimate}
        onAutoEstimateChange={setAutoEstimate}
        estimatedMin={estimatedMin}
        onEstimatedMinChange={setEstimatedMin}
        vocabCount={wordCount}
      />

      <WordsEditor
        minutes={displayMinutes}
        onChange={setVocabs}
        minRequired={5}
      />

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
