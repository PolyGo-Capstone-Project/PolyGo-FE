import {
  TransactionMethod,
  TransactionStatus,
  TransactionTypeEnum,
} from "@/constants";
import {
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";
import z from "zod";

export const WalletSchema = z.object({
  id: z.string(),
  balance: z.number().min(0).default(0),
  userId: z.string(),
});

export const WalletTransactionsSchema = z.object({
  id: z.string(),
  amount: z.number(),
  remainingBalance: z.number().min(0),
  transactionType: z.enum(TransactionTypeEnum),
  transactionMethod: z.enum(TransactionMethod),
  transactionStatus: z.enum(TransactionStatus),
  walletId: z.string(),
  createdAt: z.iso.datetime(),
});

export const TransactionListItemSchema = WalletTransactionsSchema.omit({
  walletId: true,
});

//GET History
export const GetTransactionsQuerySchema = PaginationLangQuerySchema;

export const GetTransactionsResSchema = z.object({
  data: z.object({
    items: z.array(TransactionListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//GET MY BALANCE
export const GetMyBalanceResSchema = z.object({
  data: z.object({
    balance: z.number().min(0).default(0),
    totalEarned: z.number().min(0).default(0),
    totalSpent: z.number().min(0).default(0),
    totalWithdrawn: z.number().min(0).default(0),
  }),
  message: z.string(),
});

//types
export type WalletType = z.infer<typeof WalletSchema>;
export type WalletTransactionsType = z.infer<typeof WalletTransactionsSchema>;
export type TransactionListItemType = z.infer<typeof TransactionListItemSchema>;
export type GetTransactionsQueryType = z.infer<
  typeof GetTransactionsQuerySchema
>;
export type GetTransactionsResType = z.infer<typeof GetTransactionsResSchema>;
export type GetMyBalanceResType = z.infer<typeof GetMyBalanceResSchema>;
