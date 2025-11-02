"use client";

import FiltersBar from "@/components/modules/game/filter-bar";
import HowToPlay from "@/components/modules/game/how-to-play";
import PuzzleCard from "@/components/modules/game/puzzle-card";
import WordPuzzleHeader from "@/components/modules/game/word-puzzle-header";
import { useMemo, useState } from "react";

/** ====== Types chỉ dùng trong trang này ====== */
type Creator = { name: string; avatarUrl?: string; initials: string };
type PuzzleSet = {
  id: string;
  title: string;
  description: string;
  language: string;
  languageLabel: string;
  level: "easy" | "medium" | "hard";
  category: string;
  wordCount: number;
  estTimeMin: number;
  plays: number;
  bestTimeSec?: number;
  creator: Creator;
  avatar?: string;
};

/** ====== Mock data chỉ dùng trong trang này ====== */
const MOCK_PUZZLES: PuzzleSet[] = [
  {
    id: "vn-food",
    title: "Vietnamese Food Vocabulary",
    description: "Learn essential Vietnamese food terms and cooking vocabulary",
    language: "vi",
    languageLabel: "Vietnamese",
    level: "easy",
    category: "food",
    wordCount: 6,
    estTimeMin: 8,
    plays: 156,
    bestTimeSec: 245,
    creator: {
      name: "NguyenMinh",
      initials: "NM",
      avatarUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s",
    },
  },
  {
    id: "fr-cinema",
    title: "French Cinema Vocabulary",
    description: "Essential terms for discussing French films and cinema",
    language: "fr",
    languageLabel: "French",
    level: "medium",
    category: "culture",
    wordCount: 5,
    estTimeMin: 12,
    plays: 89,
    bestTimeSec: 380,
    creator: {
      name: "AnnaFR",
      initials: "AF",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
    },
  },
  {
    id: "en-business",
    title: "Business English Essentials",
    description: "Key vocabulary for professional English communication",
    language: "en",
    languageLabel: "English",
    level: "hard",
    category: "business",
    wordCount: 5,
    estTimeMin: 15,
    plays: 234,
    bestTimeSec: 500,
    creator: {
      name: "JohnEN",
      initials: "JE",
      avatarUrl: "https://i.pravatar.cc/150?img=53",
    },
  },
];

export default function GameContent() {
  const [q, setQ] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const puzzles = useMemo<PuzzleSet[]>(() => {
    return MOCK_PUZZLES.filter((p) => {
      const matchesQuery = q
        ? (p.title + p.description + p.languageLabel + p.category)
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;
      const matchesLang = langFilter === "all" || p.language === langFilter;
      const matchesLevel = levelFilter === "all" || p.level === levelFilter;
      const matchesCat = catFilter === "all" || p.category === catFilter;
      return matchesQuery && matchesLang && matchesLevel && matchesCat;
    });
  }, [q, langFilter, levelFilter, catFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <WordPuzzleHeader />
      <HowToPlay />
      <FiltersBar
        q={q}
        onQ={setQ}
        lang={langFilter}
        onLang={setLangFilter}
        level={levelFilter}
        onLevel={setLevelFilter}
        cat={catFilter}
        onCat={setCatFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {puzzles.map((p) => (
          <PuzzleCard key={p.id} data={p} />
        ))}
      </div>
    </div>
  );
}
