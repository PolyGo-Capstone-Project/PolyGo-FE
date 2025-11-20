import {
  LangQuerySchema,
  MessageResSchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";
import { LanguageListItemSchema } from "@/models/language.model";
import z from "zod";

/* ====== Enums (theo response mẫu) ====== */
export const WordsetStatus = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;
export type WordsetStatus = (typeof WordsetStatus)[keyof typeof WordsetStatus];

export const WordsetDifficulty = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
} as const;
export type WordsetDifficulty =
  (typeof WordsetDifficulty)[keyof typeof WordsetDifficulty];

export const WordsetCategory = {
  FOOD: "Food",
  TRAVEL: "Travel",
  BUSINESS: "Business",
  TECH: "Tech",
  CULTURE: "Culture",
  DAILY: "Daily",
  EDUCATION: "Education",
  HEALTH: "Health",
} as const;
export type WordsetCategory =
  (typeof WordsetCategory)[keyof typeof WordsetCategory];

//List game cho user
/* ====== Schemas ====== */
const CreatorLiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional().nullable(),
});

const InterestLiteSchema = z.object({
  id: z.string(),
  iconUrl: z.string(),
  name: z.string(),
});

export const WordsetListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(WordsetStatus),
  difficulty: z.enum(WordsetDifficulty),
  interest: InterestLiteSchema.optional(),
  estimatedTimeInMinutes: z.number().int(),
  playCount: z.number().int(),
  averageTimeInSeconds: z.number().int(),
  averageRating: z.number(),
  wordCount: z.number().int(),
  language: LanguageListItemSchema.pick({
    id: true,
    code: true,
    iconUrl: true,
    name: true,
  }),
  creator: CreatorLiteSchema,
  createdAt: z.iso.datetime(),
});

/* ====== Query (GET /wordsets) ====== */
export const GetWordsetsQuerySchema = PaginationLangQuerySchema.merge(
  z.object({
    name: z.string().max(200).optional(),
    languageIds: z.array(z.string()).optional(),
    difficulty: z.enum(WordsetDifficulty).optional(),
    interestIds: z.array(z.string()).optional(),
  })
);

//search for admin
export const SearchWordsetsQuerySchema = GetWordsetsQuerySchema;

/* ====== Response ====== */
export const GetWordsetsResSchema = z.object({
  data: z.object({
    items: z.array(WordsetListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//Tạo game
/* ====== Word Item Schema ====== */
export const WordItemSchema = z.object({
  word: z.string().max(200),
  definition: z.string().max(500),
  hint: z.string().max(500).optional(),
  pronunciation: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
});

/* ====== Create Wordset Body ====== */
export const CreateWordsetBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  languageId: z.string(),
  interestId: z.string(),
  difficulty: z.enum(WordsetDifficulty),
  words: z.array(WordItemSchema).min(1),
});

/* ====== Response ====== */
export const CreateWordsetResSchema = z.object({
  data: z
    .object({
      id: z.string(),
      message: z.string().optional(),
    })
    .optional(),
  message: z.string(),
});

/* ====== My Created Wordsets ====== */
export const MyCreatedWordsetItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(WordsetStatus),
  difficulty: z.enum(WordsetDifficulty),
  category: z.string(),
  estimatedTimeInMinutes: z.number().int(),
  playCount: z.number().int(),
  averageTimeInSeconds: z.number().int(),
  averageRating: z.number(),
  wordCount: z.number().int(),
  totalPlays: z.number().int(),
  createdAt: z.string(),
});

export const GetMyCreatedWordsetsResSchema = z.object({
  data: z.object({
    items: z.array(MyCreatedWordsetItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

/* ====== DETAIL ====== */
export const WordsetDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(WordsetStatus),
  difficulty: z.enum(WordsetDifficulty),
  interest: InterestLiteSchema.optional(),
  estimatedTimeInMinutes: z.number().int(),
  playCount: z.number().int(),
  averageTimeInSeconds: z.number().int(),
  averageRating: z.number(),
  wordCount: z.number().int(),
  language: LanguageListItemSchema.pick({
    id: true,
    code: true,
    iconUrl: true,
    name: true,
  }),
  creator: CreatorLiteSchema,
  words: z.array(
    z.object({
      id: z.string(),
      word: z.string(),
      definition: z.string(),
      hint: z.string().optional().nullable(),
      pronunciation: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
    })
  ),
  createdAt: z.string(), // dùng .iso.datetime() nếu server luôn ISO
  lastUpdatedAt: z.string(),
});

export const GetWordsetByIdQuerySchema = LangQuerySchema;

export const GetWordsetByIdResSchema = z.object({
  data: WordsetDetailSchema,
  message: z.string(),
});

/* ====== UPDATE ====== */
export const UpdateWordsetBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  languageId: z.string().min(1),
  interestId: z.string().min(1),
  difficulty: z.enum(WordsetDifficulty),
  words: z
    .array(
      z.object({
        id: z.string().optional(), // word cũ có id; word mới có thể không có
        word: z.string().min(1),
        definition: z.string().min(1),
        hint: z.string().optional().nullable(),
        pronunciation: z.string().optional().nullable(),
        imageUrl: z.string().optional().nullable(),
      })
    )
    .min(1),
});

export const UpdateWordsetResSchema = MessageResSchema;

//Delete game
export type DeleteWordsetParams = { id: string };

export type DeleteWordsetResponse = {
  message: string;
};

/* ========= ADMIN: GET /wordsets/admin ========= */

export const AdminWordsetListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(WordsetStatus),
  difficulty: z.enum(WordsetDifficulty),
  category: z.string(),
  playCount: z.number().int(),
  averageTimeInSeconds: z.number().int(),
  averageRating: z.number(),
  wordCount: z.number().int(),
  interest: InterestLiteSchema.optional(),
  creator: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional().nullable(),
  }),
  createdAt: z.string(),
});

// Query: giống user + thêm status
export const GetAdminWordsetsQuerySchema = PaginationLangQuerySchema.merge(
  z.object({
    name: z.string().max(200).optional(),
    status: z.enum(WordsetStatus).optional(),
    languageIds: z.array(z.string()).optional(),
    difficulty: z.enum(WordsetDifficulty).optional(),
    category: z.string().optional(),
    interestIds: z.array(z.string()).optional(),
  })
);

export const GetAdminWordsetsResSchema = z.object({
  data: z.object({
    items: z.array(AdminWordsetListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

/* ========= ADMIN: POST /wordsets/admin/status ========= */

export const UpdateWordsetStatusBodySchema = z.object({
  wordSetId: z.string(),
  status: z.enum(WordsetStatus),
  rejectionReason: z.string().optional().nullable(),
});

export const UpdateWordsetStatusResSchema = MessageResSchema;

//played tab
/* ====== My Played Wordsets ====== */
export const MyPlayedWordsetItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  difficulty: z.enum(WordsetDifficulty),
  category: z.string(),
  bestTime: z.number().int(),
  bestScore: z.number().int(),
  playCount: z.number().int(),
  lastPlayed: z.string(), // ISO datetime
  creator: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional().nullable(),
  }),
});

export const GetMyPlayedWordsetsResSchema = z.object({
  data: z.object({
    items: z.array(MyPlayedWordsetItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

/* ======================= Leaderboard ======================= */
export const WordsetLeaderboardPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export const WordsetLeaderboardItemSchema = z.object({
  rank: z.number(),
  player: WordsetLeaderboardPlayerSchema,
  completionTimeInSecs: z.number(),
  score: z.number(),
  mistakes: z.number(),
  hintsUsed: z.number(),
  xpEarned: z.number(),
  completedAt: z.string(),
  isMe: z.boolean(),
});

export const WordsetLeaderboardDataSchema = z.object({
  items: z.array(WordsetLeaderboardItemSchema),
  // Tái sử dụng meta chuẩn
  totalItems: PaginationMetaSchema.shape.totalItems,
  currentPage: PaginationMetaSchema.shape.currentPage,
  totalPages: PaginationMetaSchema.shape.totalPages,
  pageSize: PaginationMetaSchema.shape.pageSize,
  hasPreviousPage: PaginationMetaSchema.shape.hasPreviousPage,
  hasNextPage: PaginationMetaSchema.shape.hasNextPage,
});

export const WordsetLeaderboardResponseSchema = z.object({
  data: WordsetLeaderboardDataSchema,
  message: z.string(),
});

//best score

/* ======================= My Best Score ======================= */
export const MyBestWordsetScoreSchema = z.object({
  hasPlayed: z.boolean(),
  completionTimeInSecs: z.number().optional(),
  score: z.number().optional(),
  mistakes: z.number().optional(),
  hintsUsed: z.number().optional(),
  xpEarned: z.number().optional(),
  completedAt: z.string().optional(),
  rank: z.number().optional(),
  totalPlayers: z.number().optional(),
});

export const MyBestWordsetScoreResponseSchema = z.object({
  data: MyBestWordsetScoreSchema,
  message: z.string(),
});

// [ADD] ==== GAMEPLAY: common word schema ====
export const GameWordSchema = z.object({
  id: z.string(),
  scrambledWord: z.string(),
  definition: z.string(),
  hint: z.string().optional().nullable(),
  pronunciation: z.string().optional().nullable(),
});

// [ADD] ==== GAMEPLAY: Start game (POST /wordsets/:id/start) ====
export const StartWordsetGameDataSchema = z.object({
  wordSetId: z.string(),
  totalWords: z.number().int(),
  currentWordIndex: z.number().int(),
  currentWord: GameWordSchema,
  startTime: z.string(), // ISO
});

export const StartWordsetGameResSchema = z.object({
  data: StartWordsetGameDataSchema,
  message: z.string(),
});

// [ADD] ==== GAMEPLAY: Play (POST /wordsets/play) ====
export const PlayWordsetBodySchema = z.object({
  wordSetId: z.string(),
  wordId: z.string(),
  answer: z.string(),
});

export const PlayWordsetResSchema = z.object({
  data: z.object({
    isCorrect: z.boolean(),
    isCompleted: z.boolean(),
    currentWordIndex: z.number().int(),
    totalWords: z.number().int(),
    mistakes: z.number().int(),
    hintsUsed: z.number().int(),
    score: z.number().int(),
    xpEarned: z.number().int(),
    completionTimeInSeconds: z.number().int(),
    // Khi chưa complete sẽ có nextWord; khi complete có thể không có
    nextWord: GameWordSchema.optional(),
  }),
  message: z.string(),
});

// [ADD] ==== GAMEPLAY: Game state (GET /wordsets/:id/game-state) ====
export const WordsetGameStateDataSchema = z.object({
  wordSetId: z.string(),
  totalWords: z.number().int(),
  currentWordIndex: z.number().int(),
  completedWords: z.number().int(),
  currentWord: GameWordSchema,
  mistakes: z.number().int(),
  hintsUsed: z.number().int(),
  elapsedTime: z.number().int(), // seconds
  startTime: z.string(),
});

export const WordsetGameStateResSchema = z.object({
  data: WordsetGameStateDataSchema,
  message: z.string(),
});

// [ADD] ==== GAMEPLAY: Hint usage (POST /wordsets/:id/hint) ====
export const UseHintBodySchema = z.object({
  wordId: z.string(),
});

export const UseHintDataSchema = z.object({
  wordId: z.string(),
  totalHintsUsed: z.number().int(),
});

export const UseHintResSchema = z.object({
  data: UseHintDataSchema,
  message: z.string(),
});
/* ====== Types ====== */
//List game cho user
export type WordsetListItemType = z.infer<typeof WordsetListItemSchema>;
export type GetWordsetsQueryType = z.infer<typeof GetWordsetsQuerySchema>;
export type GetWordsetsResType = z.infer<typeof GetWordsetsResSchema>;
//Tạo game
/* ====== Types ====== */
export type WordItemType = z.infer<typeof WordItemSchema>;
export type CreateWordsetBodyType = z.infer<typeof CreateWordsetBodySchema>;
export type CreateWordsetResType = z.infer<typeof CreateWordsetResSchema>;
//My Created Wordsets
export type MyCreatedWordsetItemType = z.infer<
  typeof MyCreatedWordsetItemSchema
>;
export type GetMyCreatedWordsetsResType = z.infer<
  typeof GetMyCreatedWordsetsResSchema
>;
//Detail and Edit game
export type WordsetDetailType = z.infer<typeof WordsetDetailSchema>;
export type GetWordsetByIdQueryType = z.infer<typeof GetWordsetByIdQuerySchema>;
export type GetWordsetByIdResType = z.infer<typeof GetWordsetByIdResSchema>;
export type UpdateWordsetBodyType = z.infer<typeof UpdateWordsetBodySchema>;
export type UpdateWordsetResType = z.infer<typeof UpdateWordsetResSchema>;
//Delete game
export type DeleteWordsetResType = DeleteWordsetResponse;
export type DeleteWordsetBodyType = DeleteWordsetParams;
//Admin
export type GetAdminWordsetsQueryType = z.infer<
  typeof GetAdminWordsetsQuerySchema
>;
export type GetAdminWordsetsResType = z.infer<typeof GetAdminWordsetsResSchema>;

export type UpdateWordsetStatusBodyType = z.infer<
  typeof UpdateWordsetStatusBodySchema
>;
export type UpdateWordsetStatusResType = z.infer<
  typeof UpdateWordsetStatusResSchema
>;
//Played tab
export type MyPlayedWordsetItemType = z.infer<typeof MyPlayedWordsetItemSchema>;
export type GetMyPlayedWordsetsResType = z.infer<
  typeof GetMyPlayedWordsetsResSchema
>;
//Leaderboard
export type WordsetLeaderboardPlayer = z.infer<
  typeof WordsetLeaderboardPlayerSchema
>;
export type WordsetLeaderboardItem = z.infer<
  typeof WordsetLeaderboardItemSchema
>;
export type WordsetLeaderboardData = z.infer<
  typeof WordsetLeaderboardDataSchema
>;
export type WordsetLeaderboardResponse = z.infer<
  typeof WordsetLeaderboardResponseSchema
>;
//best score
export type MyBestWordsetScore = z.infer<typeof MyBestWordsetScoreSchema>;
export type MyBestWordsetScoreResponse = z.infer<
  typeof MyBestWordsetScoreResponseSchema
>;
// [ADD] ==== GAMEPLAY: Export types ====
export type StartWordsetGameResType = z.infer<typeof StartWordsetGameResSchema>;
export type PlayWordsetBodyType = z.infer<typeof PlayWordsetBodySchema>;
export type PlayWordsetResType = z.infer<typeof PlayWordsetResSchema>;
export type WordsetGameStateResType = z.infer<typeof WordsetGameStateResSchema>;
// [ADD] Hint usage
export type UseHintBodyType = z.infer<typeof UseHintBodySchema>;
export type UseHintResType = z.infer<typeof UseHintResSchema>;
// NEW: search type (giống SearchEventsQueryType)
export type SearchWordsetsQueryType = z.infer<typeof SearchWordsetsQuerySchema>;
