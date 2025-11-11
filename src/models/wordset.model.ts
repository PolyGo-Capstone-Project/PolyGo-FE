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

export const WordsetListItemSchema = z.object({
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
    category: z.string().optional(),
  })
);

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
  category: z.enum(WordsetCategory),
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
  category: z.string(),
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
  category: z.string().min(1),
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
    status: z.enum(WordsetStatus).optional(),
    languageIds: z.array(z.string()).optional(),
    difficulty: z.enum(WordsetDifficulty).optional(),
    category: z.string().optional(),
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
