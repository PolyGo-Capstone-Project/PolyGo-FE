"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CircleHelp, Plus, Timer, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Vocab = {
  id: string;
  word: string;
  pronunciation?: string;
  definition: string;
  hint?: string;
  imageUrl?: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function WordsEditor({
  minutes,
  onChange,
  minRequired = 5,
  initialVocabs,
}: {
  minutes: number;
  onChange: (vocabs: Vocab[]) => void;
  minRequired?: number;
  initialVocabs?: Omit<Vocab, "id">[];
}) {
  const t = useTranslations();
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize with initialVocabs if provided (only once)
  useEffect(() => {
    if (initialVocabs && initialVocabs.length > 0 && !initialized) {
      const vocabsWithIds = initialVocabs.map((v) => ({
        ...v,
        id: uid(),
      }));
      setVocabs(vocabsWithIds);
      onChange(vocabsWithIds);
      setInitialized(true);
    }
  }, [initialVocabs, initialized, onChange]);

  const sync = (next: Vocab[]) => {
    setVocabs(next);
    onChange(next);
  };

  const addWordCard = () =>
    sync([
      ...vocabs,
      { id: uid(), word: "", pronunciation: "", definition: "", hint: "" },
    ]);

  const removeWordCard = (id: string) =>
    sync(vocabs.filter((v) => v.id !== id));

  const updateWord = (id: string, patch: Partial<Vocab>) =>
    sync(vocabs.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const wordCount = vocabs.length;
  const notEnough = wordCount < minRequired;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <CircleHelp className="h-5 w-5" />
          {t("create.words.title")}{" "}
          <span className="text-muted-foreground text-sm">
            ({wordCount} {t("meta.words")})
          </span>
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Timer className="h-4 w-4" />~{minutes} {t("create.words.min")}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {notEnough && (
          <div className="rounded-md border p-3 text-sm flex items-center gap-2 text-amber-700 bg-amber-50 dark:bg-amber-900/20">
            <AlertCircle className="h-4 w-4" />
            {t("create.word.minRequired", {
              default: "Please add at least {n} words.",
              n: minRequired,
            })}
          </div>
        )}

        {vocabs.length === 0 && (
          <div className="rounded-md border p-4 text-sm text-center text-muted-foreground">
            {t("create.words.empty")}
          </div>
        )}

        {vocabs.map((v, idx) => {
          const invalidWord = !v.word.trim();
          const invalidDef = !v.definition.trim();
          return (
            <div key={v.id} className="rounded-lg border p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {t("create.words.wordIndex", { index: idx + 1 })}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWordCard(v.id)}
                  aria-label={t("create.words.removeAria")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>{t("create.words.word")} *</Label>
                  <Input
                    value={v.word}
                    onChange={(e) => updateWord(v.id, { word: e.target.value })}
                    placeholder={t("create.words.wordPh")}
                    className={invalidWord ? "border-red-500" : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    {t("create.words.pron")} ({t("create.common.optional")})
                  </Label>
                  <Input
                    value={v.pronunciation ?? ""}
                    onChange={(e) =>
                      updateWord(v.id, { pronunciation: e.target.value })
                    }
                    placeholder="/ˈæp.əl/"
                  />
                </div>

                <div className="sm:col-span-2 grid gap-2">
                  <Label>{t("create.words.def")} *</Label>
                  <Textarea
                    value={v.definition}
                    onChange={(e) =>
                      updateWord(v.id, { definition: e.target.value })
                    }
                    placeholder={t("create.words.defPh")}
                    className={`min-h-[72px] ${invalidDef ? "border-red-500" : ""}`}
                  />
                </div>

                <div className="sm:col-span-2 grid gap-2">
                  <Label>
                    {t("create.words.hint")} ({t("create.common.optional")})
                  </Label>
                  <Input
                    value={v.hint ?? ""}
                    onChange={(e) => updateWord(v.id, { hint: e.target.value })}
                    placeholder={t("create.words.hintPh")}
                  />
                </div>

                {/* Nếu muốn cho nhập ảnh minh họa */}
                {/* <div className="sm:col-span-2 grid gap-2">
                  <Label>
                    {t("create.words.imageUrl")} ({t("create.common.optional")})
                  </Label>
                  <Input
                    value={v.imageUrl ?? ""}
                    onChange={(e) => updateWord(v.id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div> */}
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto gap-2"
          onClick={addWordCard}
        >
          <Plus className="h-4 w-4" />
          {t("create.words.add")}
        </Button>
      </CardContent>
    </Card>
  );
}
