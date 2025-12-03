"use client";

import BasicInfo from "@/components/modules/game/create-set/basic-info";
import CatDiff from "@/components/modules/game/create-set/categories-difficult";
import CreateHeader from "@/components/modules/game/create-set/create-header";
import SubmitPanel from "@/components/modules/game/create-set/submit-panel";
import WordsEditor from "@/components/modules/game/create-set/word-editor";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCreateWordsetMutation } from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { CreateWordsetBodyType, WordsetDifficulty } from "@/models";

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
  const t = useTranslations("CreateWordPuzzleSet");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  // Parse prefill data from URL (from AI Summary)
  const prefillData = useMemo(() => {
    const fromEvent = searchParams.get("fromEvent");
    const title = searchParams.get("title");
    const languageId = searchParams.get("languageId");
    const interestId = searchParams.get("interestId");
    const vocabsJson = searchParams.get("vocabs");

    let vocabs: { word: string; definition: string; hint?: string }[] = [];
    if (vocabsJson) {
      try {
        vocabs = JSON.parse(vocabsJson);
      } catch {
        vocabs = [];
      }
    }

    return {
      fromEvent,
      title: title || "",
      languageId: languageId || null,
      interestId: interestId || null,
      vocabs,
    };
  }, [searchParams]);

  // form state - initialize with prefill data if available
  const [title, setTitle] = useState(prefillData.title);
  const [description, setDescription] = useState(
    prefillData.fromEvent
      ? t("fromEventDescription", {
          default: "Word set created from meeting vocabulary",
        })
      : ""
  );

  // BasicInfo -> chọn từ API: languageId
  const [languageId, setLanguageId] = useState<string | null>(
    prefillData.languageId
  );

  // CatDiff -> enum-driven
  const [categoryId, setCategoryId] = useState<string | null>(
    prefillData.interestId
  );
  const [difficulty, setDifficulty] = useState<WordsetDifficulty>("Easy");

  const [autoEstimate, setAutoEstimate] = useState(true);
  const [estimatedMin, setEstimatedMin] = useState<number>(5);

  // Words
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const wordCount = vocabs.length;

  // Prefill vocabs for WordsEditor
  const initialVocabs = useMemo(() => {
    if (prefillData.vocabs.length > 0) {
      return prefillData.vocabs.map((v) => ({
        word: v.word,
        definition: v.definition,
        hint: v.hint,
        pronunciation: undefined,
        imageUrl: undefined,
      }));
    }
    return undefined;
  }, [prefillData.vocabs]);

  // Update title when prefillData changes (for SSR hydration)
  useEffect(() => {
    if (prefillData.title && !title) {
      setTitle(prefillData.title);
    }
    if (prefillData.languageId && !languageId) {
      setLanguageId(prefillData.languageId);
    }
    if (prefillData.interestId && !categoryId) {
      setCategoryId(prefillData.interestId);
    }
  }, [prefillData, title, languageId, categoryId]);

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
      categoryId &&
      minWordsOk &&
      allWordsValid
  );

  // post api
  const createWordsetMutation = useCreateWordsetMutation();

  const handleSubmit = async () => {
    if (!canSubmit || createWordsetMutation.isPending) return;

    const payload: CreateWordsetBodyType = {
      title: title.trim(),
      description: description.trim(),
      languageId: languageId as string,
      interestId: categoryId as string,
      difficulty: difficulty as WordsetDifficulty, // "Easy" | "Medium" | "Hard"
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
      // ✅ dùng helper success giống ManageBadges
      showSuccessToast(res?.payload?.message, tSuccess);

      // ✅ Submit xong push về trang game
      router.push(`/${locale}/game`);
      // nếu bạn muốn về "My sets" thì đổi thành:
      // router.push(`/${locale}/game/my-sets`);
    } catch (error) {
      // ❌ dùng helper handleErrorApi + tError
      // handleErrorApi({ error, tError });
      showErrorToast("Create", tError);
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

      <WordsEditor
        minutes={displayMinutes}
        onChange={setVocabs}
        minRequired={5}
        initialVocabs={initialVocabs}
      />

      <SubmitPanel
        wordCount={wordCount}
        minutes={displayMinutes}
        canSubmit={canSubmit}
        onBack={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
