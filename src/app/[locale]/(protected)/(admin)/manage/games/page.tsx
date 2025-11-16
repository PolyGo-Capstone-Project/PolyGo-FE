"use client";

import { Pagination } from "@/components/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  IconEye,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { UpdateWordsetStatusDialog } from "@/components/modules/admin/game/update-status-dialog";
import { useInterestsQuery } from "@/hooks";
import { useLanguagesQuery } from "@/hooks/query/use-language";
import {
  useGetAdminWordsets,
  useWordsetDetailQuery,
} from "@/hooks/query/use-wordset";
import { WordsetDifficulty, WordsetStatus } from "@/models";

/* ----------------- helpers ----------------- */
const statusList: WordsetStatus[] = [
  "Draft",
  "Pending",
  "Approved",
  "Rejected",
];

const difficultyList: (keyof typeof WordsetDifficulty)[] = [
  "EASY",
  "MEDIUM",
  "HARD",
];

const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved") return "default";
  if (s === "pending") return "secondary";
  if (s === "rejected") return "destructive";
  return "outline";
};

export default function ManageWordsets() {
  const t = useTranslations("admin.wordsets");
  const tFilters = useTranslations("admin.wordsets.filters");
  const tCols = useTranslations("admin.wordsets.columns");
  const tStatus = useTranslations("admin.wordsets.status");
  const locale = useLocale();

  type AdminStatus = WordsetStatus; // "Draft" | "Pending" | "Approved" | "Rejected"

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  // ✅ debounce 400ms cho search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [status, setStatus] = useState<AdminStatus | "all">("all");
  const [languageId, setLanguageId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // languages
  const { data: languagesData } = useLanguagesQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 200 },
  });
  const languages = languagesData?.payload?.data?.items ?? [];

  const { data: interestsData } = useInterestsQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 200 },
  });
  const interests = interestsData?.payload?.data?.items ?? [];

  const interestMap = useMemo(() => {
    const m = new Map<string, any>();
    interests.forEach((it: any) => {
      if (it?.id) m.set(it.id, it);
    });
    return m;
  }, [interests]);

  // ✅ Debounce logic: sau 400ms không gõ nữa mới update term dùng cho query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // query build
  const query = useMemo(() => {
    // map difficulty "EASY|MEDIUM|HARD" -> "Easy|Medium|Hard"
    const toApiDifficulty = (
      val: string
    ): "Easy" | "Medium" | "Hard" | undefined => {
      if (val === "EASY") return "Easy";
      if (val === "HARD") return "Hard";
      if (val === "MEDIUM") return "Medium";
      return undefined;
    };

    return {
      lang: locale,
      pageNumber: page,
      pageSize,
      ...(debouncedSearchTerm ? { name: debouncedSearchTerm } : {}),
      ...(status !== "all" ? { status: status as AdminStatus } : {}),
      ...(difficulty !== "all"
        ? { difficulty: toApiDifficulty(difficulty) }
        : {}),
      ...(category !== "all" ? { category } : {}),
      ...(languageId !== "all"
        ? { languageIds: [languageId] as string[] }
        : {}),
    };
  }, [
    locale,
    page,
    pageSize,
    debouncedSearchTerm,
    status,
    difficulty,
    category,
    languageId,
  ]);

  // data
  const listQuery = useGetAdminWordsets(query, { enabled: true });
  const items = listQuery.data?.payload?.data?.items ?? [];
  const totalPages = listQuery.data?.payload?.data?.totalPages ?? 1;
  const totalItems = listQuery.data?.payload?.data?.totalItems ?? 0;

  // ✅ reset trang khi filter/search (đã debounce) thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, status, difficulty, category, languageId]);

  const hasActiveFilters =
    searchTerm.trim() ||
    status !== "all" ||
    languageId !== "all" ||
    difficulty !== "all" ||
    category !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatus("all");
    setLanguageId("all");
    setDifficulty("all");
    setCategory("all");
    setPage(1);
  };

  // detail sheet state
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const openDetailSheet = (id: string) => {
    setDetailId(id);
    setOpenDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("tableTitle")}</CardTitle>
              <CardDescription>{t("tableDescription")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => listQuery.refetch()}
                disabled={listQuery.isLoading}
              >
                <IconRefresh
                  className={`mr-2 size-4 ${
                    listQuery.isLoading ? "animate-spin" : ""
                  }`}
                />
                {t("refresh")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tFilters("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconFilter className="mr-2 size-4" />
                  {tFilters("title")}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {
                        [
                          status !== "all",
                          languageId !== "all",
                          difficulty !== "all",
                          category !== "all",
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="p-4">
                <SheetHeader>
                  <SheetTitle>{tFilters("title")}</SheetTitle>
                  <SheetDescription>{tFilters("description")}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <Label>{tFilters("status")}</Label>
                      <Select
                        value={status}
                        onValueChange={(v) =>
                          setStatus(v as AdminStatus | "all")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={tFilters("allStatuses")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {tFilters("allStatuses")}
                          </SelectItem>
                          {/* statusList = ["Draft","Pending","Approved","Rejected"] */}
                          {statusList.map((s) => (
                            <SelectItem key={s} value={s}>
                              {tStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label>{tFilters("language")}</Label>
                      <Select value={languageId} onValueChange={setLanguageId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={tFilters("allLanguages")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {tFilters("allLanguages")}
                          </SelectItem>
                          {languages.map((l: any) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <Label>{tFilters("difficulty")}</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={tFilters("allDifficulties")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {tFilters("allDifficulties")}
                          </SelectItem>
                          {difficultyList.map((k) => {
                            const key = k.toLowerCase(); // "easy" | "medium" | "hard"
                            return (
                              <SelectItem key={k} value={k}>
                                {t(`filters.wordset.difficulty.${key}`, {
                                  default: capitalize(key),
                                })}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category (Interest) */}
                    <div className="space-y-2">
                      <Label>{tFilters("category")}</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={tFilters("allCategories")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {tFilters("allCategories")}
                          </SelectItem>
                          {interests.map((i: any) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      <IconX className="mr-2 size-4" />
                      {tFilters("clearFilters")}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      {tFilters("apply")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Table */}
          {listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("errorTitle")}</h3>
                <p className="mt-2 text-muted-foreground">{t("error")}</p>
                <Button className="mt-4" onClick={() => listQuery.refetch()}>
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
                <p className="mt-2 text-muted-foreground">
                  {t("emptyDescription")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{tCols("no")}</TableHead>
                      <TableHead className="min-w-[220px]">
                        {tCols("title")}
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        {tCols("creator")}
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        {tCols("status")}
                      </TableHead>
                      <TableHead className="min-w-[140px]">
                        {tCols("category")}
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        {tCols("difficulty")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {tCols("words")}
                      </TableHead>
                      <TableHead className="min-w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((ws: any, idx: number) => (
                      <TableRow key={ws.id}>
                        <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {ws.title}
                        </TableCell>
                        <TableCell>{ws.creator?.name ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge(ws.status)}>
                            {tStatus(ws.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ws.interest
                            ? (interestMap.get(ws.interest.id)?.name ??
                              ws.interest.name)
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {t(
                            `filters.wordset.difficulty.${(
                              ws.difficulty ?? "Medium"
                            ).toLowerCase()}`,
                            {
                              default: ws.difficulty,
                            }
                          )}
                        </TableCell>
                        <TableCell>{ws.wordCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailSheet(ws.id)}
                              aria-label="View details"
                            >
                              <IconEye className="size-4" />
                            </Button>
                            <UpdateWordsetStatusDialog wordsetId={ws.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  hasNextPage={page < totalPages}
                  hasPreviousPage={page > 1}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      {detailId && (
        <WordsetDetailSheet
          id={detailId}
          open={openDetail}
          onOpenChange={setOpenDetail}
        />
      )}
    </div>
  );
}

/* ====================== Detail Sheet (fixed) ====================== */
function WordsetDetailSheet({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("admin.wordsets.detail");
  const tStatus = useTranslations("admin.wordsets.status");

  const { data, isLoading } = useWordsetDetailQuery({
    id,
    lang: locale,
    enabled: open,
  });

  const ws = data?.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        {isLoading || !ws ? (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xl font-semibold">{ws.title}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {ws.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={statusBadge(ws.status)}>
                {tStatus(ws.status)}
              </Badge>
              <Badge variant="secondary">{ws.interest?.name ?? "-"}</Badge>
              <Badge variant="outline">
                {t(
                  `filters.wordset.difficulty.${(
                    ws.difficulty ?? "Medium"
                  ).toLowerCase()}`,
                  { default: ws.difficulty }
                )}
              </Badge>
              <Badge variant="outline">
                {ws.wordCount} {t("words")}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-medium">{t("wordsList")}</div>
              <div className="max-h-[46vh] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{t("word")}</TableHead>
                      <TableHead>{t("definition")}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {t("hint")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(ws.words ?? []).map((w: any, i: number) => (
                      <TableRow key={w.id ?? i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{w.word}</TableCell>
                        <TableCell>{w.definition}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {w.hint ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* tiny util */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
