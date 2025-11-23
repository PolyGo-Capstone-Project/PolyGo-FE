"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  BookOpen,
  Clock,
  Pencil,
  Plus,
  Star,
  Swords,
  Target,
  Trash2,
  Trophy,
  Users2,
} from "lucide-react";

import {
  useDeleteWordsetMutation,
  useInterestsQuery,
  useLanguagesQuery,
  useMyCreatedWordsetsQuery,
  useUpdateWordsetMutation,
  useWordsetDetailQuery,
} from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { WordsetDifficulty } from "@/models";

/* ==================== Local helpers ==================== */
type UiDifficulty = "easy" | "medium" | "hard";

const LEVEL_BADGE_STYLE: Record<UiDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const toUiLevel = (d?: string): UiDifficulty => {
  switch ((d || "").toLowerCase()) {
    case "easy":
      return "easy";
    case "hard":
      return "hard";
    default:
      return "medium";
  }
};

const isApproved = (s?: string) => (s || "").toLowerCase() === "approved";
const isPending = (s?: string) => (s || "").toLowerCase() === "pending";
const isRejected = (s?: string) => (s || "").toLowerCase() === "rejected";

/* ==================== UI ==================== */
export default function CreatedTab() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // list
  const { data, isLoading } = useMyCreatedWordsetsQuery({
    lang: locale,
    pageNumber: 1,
    pageSize: 50,
  });

  // master interests
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });
  const interests = useMemo(
    () => (interestsData?.payload?.data?.items || []).map((it: any) => it.id),
    [interestsData?.payload?.data?.items]
  );

  const interestMap = useMemo(() => {
    const m = new Map<string, any>();
    interests.forEach((it: any) => {
      if (it?.id) m.set(it.id, it);
    });
    return m;
  }, [interests]);

  // unwrap items
  const memoItems = useMemo(() => data?.data?.items ?? [], [data?.data?.items]);

  // Split groups
  const approvedItems = useMemo(
    () => memoItems.filter((s) => isApproved(s.status)),
    [memoItems]
  );

  const reviewItems = useMemo(
    () => memoItems.filter((s) => isPending(s.status) || isRejected(s.status)),
    [memoItems]
  );

  // Stats
  const total = data?.data?.totalItems ?? memoItems.length;
  const approvedCount = approvedItems.length;
  const playsSum = useMemo(
    () =>
      memoItems.reduce((acc, s) => acc + (s.totalPlays ?? s.playCount ?? 0), 0),
    [memoItems]
  );
  const avgRating = 0.0;

  // edit dialog
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const openEditDialog = (id: string) => {
    setEditingId(id);
    setOpenEdit(true);
  };
  const closeEditDialog = () => {
    setOpenEdit(false);
    setEditingId(null);
  };

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title?: string;
  } | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const openDeleteDialog = (id: string, title?: string) => {
    setDeleteTarget({ id, title });
    setOpenDelete(true);
  };
  const closeDeleteDialog = () => {
    setOpenDelete(false);
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title={t("mysets.totalSets", { default: "Total Sets" })}
          value={total}
          Icon={Target}
          color="text-blue-600"
        />
        <StatCard
          title={t("mysets.approved", { default: "Approved" })}
          value={approvedCount}
          Icon={Trophy}
          color="text-emerald-600"
        />
        <StatCard
          title={t("mysets.totalPlays", { default: "Total Plays" })}
          value={playsSum}
          Icon={Users2}
          color="text-purple-600"
        />
        <StatCard
          title={t("mysets.avgRating", { default: "Avg Rating" })}
          value={avgRating.toFixed(1)}
          Icon={Star}
          color="text-yellow-600"
        />
      </div>

      {/* Approved list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            {t("mysets.section.approved", { default: "My Puzzle Sets" })}
          </CardTitle>
          <Badge variant="secondary">{approvedItems.length} sets</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <ListSkeleton />
          ) : approvedItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("mysets.noCreatedSets", {
                default: "You haven't created any approved puzzle sets yet.",
              })}
            </div>
          ) : (
            approvedItems.map((s) => (
              <ItemRow
                key={s.id}
                locale={locale}
                t={t}
                routerPush={router.push}
                data={s}
                status="approved"
                categoryLabel={interestMap.get(s.category)?.name ?? s.category}
                onEdit={() => openEditDialog(s.id)}
                onDelete={() => openDeleteDialog(s.id, s.title)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending + Rejected list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            {t("mysets.section.pending", { default: "Pending / Rejected" })}
          </CardTitle>
          <Badge variant="secondary">{reviewItems.length} sets</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <ListSkeleton />
          ) : reviewItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("mysets.noCreatedSets", {
                default: "You have no pending or rejected puzzle sets.",
              })}
            </div>
          ) : (
            reviewItems.map((s) => (
              <ItemRow
                key={s.id}
                locale={locale}
                t={t}
                routerPush={router.push}
                data={s}
                // ✅ phân biệt pending vs rejected để style & action
                status={isRejected(s.status) ? "rejected" : "pending"}
                categoryLabel={interestMap.get(s.category)?.name ?? s.category}
                onEdit={() => openEditDialog(s.id)}
                onDelete={() => openDeleteDialog(s.id, s.title)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingId && (
        <EditWordsetDialog
          id={editingId}
          open={openEdit}
          onOpenChange={(v) => (v ? setOpenEdit(true) : closeEditDialog())}
        />
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDeleteDialog
          open={openDelete}
          onOpenChange={(v) => (v ? setOpenDelete(true) : closeDeleteDialog())}
          id={deleteTarget.id}
          title={deleteTarget.title}
        />
      )}
    </>
  );
}

/* ==================== Confirm Delete Dialog ==================== */
function ConfirmDeleteDialog({
  id,
  title,
  open,
  onOpenChange,
}: {
  id: string;
  title?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations();
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const del = useDeleteWordsetMutation({
    onSuccess: (res) => {
      showSuccessToast(res?.message, tSuccess);
      onOpenChange(false);
    },
    onError: () => {
      showErrorToast("Delete", tError);
    },
  });

  const onConfirm = () => {
    if (!del.isPending) del.mutate({ id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("wordPuzzle.deleteTitle", { default: "Xoá bộ câu đố?" })}
          </DialogTitle>
          <DialogDescription>
            {t("wordPuzzle.deleteDesc", {
              default:
                "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá bộ câu đố này?",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {title ? (
            <span>
              {t("wordPuzzle.deleting", { default: "Đang xoá:" })}{" "}
              <b>{title}</b>
            </span>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={del.isPending}
          >
            {t("create.success.close", { default: "Đóng" })}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={del.isPending}
          >
            {del.isPending
              ? t("wordPuzzle.deleting", { default: "Đang xoá..." })
              : t("wordPuzzle.delete", { default: "Xoá" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ==================== Edit Dialog (có toast) ==================== */
function EditWordsetDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations();
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();

  // get detail
  const { data, isLoading } = useWordsetDetailQuery({
    id,
    lang: locale,
    enabled: open && Boolean(id),
  });

  // languages for select
  const { data: languagesData } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });

  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });

  const languages = languagesData?.payload?.data?.items ?? [];

  const interests = useMemo(
    () => interestsData?.payload?.data?.items ?? [],
    [interestsData?.payload?.data?.items]
  );

  // local form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [languageId, setLanguageId] = useState<string>("");
  const [interestId, setInterestId] = useState<string>("");
  const [difficulty, setDifficulty] =
    useState<keyof typeof WordsetDifficulty>("EASY");
  const [words, setWords] = useState<
    {
      id?: string;
      word: string;
      definition: string;
      hint?: string;
      pronunciation?: string;
      imageUrl?: string;
    }[]
  >([]);

  useEffect(() => {
    const detail = data?.data;
    if (!detail) return;
    setTitle(detail.title || "");
    setDesc(detail.description || "");
    setLanguageId(detail.language?.id || detail.language?.code || "");
    setInterestId(detail.interest?.id || "");

    const d = (
      detail.difficulty || "Medium"
    ).toUpperCase() as keyof typeof WordsetDifficulty;
    setDifficulty(["EASY", "MEDIUM", "HARD"].includes(d) ? d : "MEDIUM");

    setWords(
      (detail.words || []).map((w) => ({
        id: w.id,
        word: w.word,
        definition: w.definition,
        hint: w.hint ?? "",
        pronunciation: w.pronunciation ?? "",
        imageUrl: w.imageUrl ?? "",
      }))
    );
  }, [data]);

  const addWord = () =>
    setWords((prev) => [
      ...prev,
      { word: "", definition: "", hint: "", pronunciation: "", imageUrl: "" },
    ]);

  const removeWord = (idx: number) =>
    setWords((prev) => prev.filter((_, i) => i !== idx));

  const updateWord = (idx: number, patch: Partial<(typeof words)[number]>) =>
    setWords((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, ...patch } : w))
    );

  const min5 =
    words.filter((w) => w.word.trim() && w.definition.trim()).length >= 5;
  const canSave =
    title.trim() &&
    desc.trim() &&
    languageId &&
    interestId &&
    min5 &&
    !isLoading;

  // mutation có toast success
  const updateMutation = useUpdateWordsetMutation({
    onSuccess: (data) => {
      // giống create: truyền message + namespace "Success"
      showSuccessToast(data?.message, tSuccess);
    },
  });

  const onSave = async () => {
    if (!canSave || updateMutation.isPending) return;
    try {
      await updateMutation.mutateAsync({
        id,
        body: {
          title,
          description: desc,
          languageId,
          interestId,
          difficulty: difficulty as any,
          words: words.map((w) => ({
            id: w.id,
            word: w.word,
            definition: w.definition,
            hint: w.hint || undefined,
            pronunciation: w.pronunciation || undefined,
            imageUrl: w.imageUrl || undefined,
          })),
        },
      });
      // thành công -> đóng dialog
      onOpenChange(false);
    } catch (error) {
      // lỗi -> toast error giống create (dùng key "Update")
      showErrorToast("Update", tError);
    }
  };

  const diffLabel = (k: keyof typeof WordsetDifficulty) =>
    t(`filters.wordset.difficulty.${capitalize(k.toLowerCase())}`, {
      default: capitalize(k.toLowerCase()),
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle>
            {t("create.title", { default: "Edit Wordset" })}
          </DialogTitle>
          <DialogDescription>
            {t("create.subtitle", {
              default: "Update your puzzle set details",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pr-1">
          {/* Basic */}
          <div className="grid grid-cols-1 gap-3">
            <div className="grid gap-2">
              <Label>
                {t("create.basicInfo.fields.name", { default: "Title" })}
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("create.basicInfo.fields.desc", { default: "Description" })}
              </Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="min-h-[72px]"
              />
            </div>
          </div>

          <Separator />

          {/* Language / Category / Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>
                {t("create.language.label", { default: "Language" })}
              </Label>
              <Select value={languageId} onValueChange={setLanguageId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("filters.language", { default: "Language" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t("filters.category", { default: "Category" })}</Label>
              <Select value={interestId} onValueChange={setInterestId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("filters.category", { default: "Category" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {interests.map((i: any) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                {t("filters.difficulty", { default: "Difficulty" })}
              </Label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setDifficulty(v as keyof typeof WordsetDifficulty)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("filters.difficulty", {
                      default: "Difficulty",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "EASY",
                      "MEDIUM",
                      "HARD",
                    ] as (keyof typeof WordsetDifficulty)[]
                  ).map((k) => (
                    <SelectItem key={k} value={k}>
                      {diffLabel(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Words Editor */}
          <div className="space-y-3">
            {/* chỉ còn label ở trên */}
            <div className="flex items-center justify-between">
              <Label className="text-base">
                {t("create.words.title", { default: "Vocabulary" })}
              </Label>
            </div>

            {words.length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-center text-muted-foreground">
                {t("create.words.empty", { default: "No words yet." })}
              </div>
            ) : (
              <div className="space-y-3">
                {words.map((w, idx) => (
                  <div key={idx} className="rounded-lg border p-3 space-y-3">
                    <div className="text-sm font-medium">
                      {t("create.words.wordIndex", {
                        index: idx + 1,
                        default: `Word #${idx + 1}`,
                      })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>
                          {t("create.words.word", { default: "Word" })}
                        </Label>
                        <Input
                          value={w.word}
                          onChange={(e) =>
                            updateWord(idx, { word: e.target.value })
                          }
                          placeholder={t("create.words.wordPh", {
                            default: "apple",
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>
                          {t("create.words.pron", {
                            default: "Pronunciation",
                          })}{" "}
                          <span className="text-muted-foreground">
                            (
                            {t("create.common.optional", {
                              default: "optional",
                            })}
                            )
                          </span>
                        </Label>
                        <Input
                          value={w.pronunciation ?? ""}
                          onChange={(e) =>
                            updateWord(idx, { pronunciation: e.target.value })
                          }
                          placeholder="/ˈæp.əl/"
                        />
                      </div>
                      <div className="sm:col-span-2 grid gap-2">
                        <Label>
                          {t("create.words.def", { default: "Definition" })}
                        </Label>
                        <Textarea
                          value={w.definition}
                          onChange={(e) =>
                            updateWord(idx, { definition: e.target.value })
                          }
                          placeholder={t("create.words.defPh", {
                            default:
                              "A round fruit that grows on trees, typically red, green, or yellow.",
                          })}
                          className="min-h-[64px]"
                        />
                      </div>
                      <div className="sm:col-span-2 grid gap-2">
                        <Label>
                          {t("create.words.hint", { default: "Hint" })}{" "}
                          <span className="text-muted-foreground">
                            (
                            {t("create.common.optional", {
                              default: "optional",
                            })}
                            )
                          </span>
                        </Label>
                        <Input
                          value={w.hint ?? ""}
                          onChange={(e) =>
                            updateWord(idx, { hint: e.target.value })
                          }
                          placeholder={t("create.words.hintPh", {
                            default: "A fruit that keeps the doctor away",
                          })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWord(idx)}
                      >
                        {t("create.words.removeAria", { default: "Remove" })}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ nút Add word đưa xuống dưới cùng */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addWord}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("create.words.add", { default: "Add word" })}
              </Button>
            </div>

            {!min5 && (
              <div className="text-sm text-destructive">
                {t("create.minRequired", {
                  default: "Please add at least 5 words.",
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("create.success.close", { default: "Close" })}
          </Button>
          <Button
            onClick={onSave}
            disabled={!canSave || updateMutation.isPending}
          >
            {updateMutation.isPending
              ? t("create.submitting", { default: "Saving..." })
              : t("actions.submitEdit", { default: "Save changes" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ==================== Row & Small components ==================== */

function ItemRow({
  data: s,
  status,
  locale,
  t,
  routerPush,
  onEdit,
  onDelete,
  categoryLabel,
}: {
  data: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    difficulty: string;
    estimatedTimeInMinutes: number;
    wordCount: number;
    totalPlays?: number;
    playCount?: number;
    interest?: {
      id: string;
      name: string;
      iconUrl?: string | null;
    };
  };
  status: "approved" | "pending" | "rejected";
  locale: string;
  t: ReturnType<typeof useTranslations>;
  routerPush: (href: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  categoryLabel: string;
}) {
  const plays = s.totalPlays ?? s.playCount ?? 0;

  // ✅ rejected thì mờ hơn
  const cardClass =
    "rounded-lg border p-4 md:p-5 bg-card hover:bg-accent/40 transition-colors " +
    (status === "rejected" ? "opacity-60" : "");

  return (
    <div className={cardClass}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{s.title}</div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {s.description ?? ""}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {s.wordCount} {t("meta.words", { default: "words" })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />~{s.estimatedTimeInMinutes}min
            </div>
            <div className="flex items-center gap-1">
              <Swords className="h-4 w-4" />
              {plays} {t("meta.plays", { default: "plays" })}
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">
              {categoryLabel ?? s.interest?.name ?? "-"}
            </Badge>
            <Badge
              className={LEVEL_BADGE_STYLE[toUiLevel(s.difficulty)]}
              variant="secondary"
            >
              {t(
                `filters.wordset.difficulty.${capitalize(
                  toUiLevel(s.difficulty)
                )}`,
                {
                  default: capitalize(toUiLevel(s.difficulty)),
                }
              )}
            </Badge>
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2 md:pt-1 md:flex-col md:items-end">
          <div className="flex gap-2">
            {/* <Button
              variant="ghost"
              className="gap-2 h-9 px-3"
              onClick={() => routerPush(`/${locale}/game/${s.id}/stats`)}
            >
              <LineChart className="h-4 w-4" />
              {t("actions.stats", { default: "Stats" })}
            </Button> */}
            <Button
              variant="ghost"
              className="gap-2 h-9 px-3"
              onClick={() => routerPush(`/${locale}/game/${s.id}/leaderboard`)}
            >
              <Trophy className="h-4 w-4" />
              {t("actions.leaderboard", { default: "Leaderboard" })}
            </Button>
          </div>
          <div className="flex gap-2">
            {status === "pending" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: string | number;
  Icon: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {title}
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1">{value}</div>
        </div>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color ?? ""}`} />
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  status,
}: {
  status: "approved" | "pending" | "rejected";
}) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        Approved
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        Pending Review
      </Badge>
    );
  }

  return (
    <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
      Rejected
    </Badge>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== tiny util ========== */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
