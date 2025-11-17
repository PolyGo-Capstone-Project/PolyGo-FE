import {
  TransactionMethod,
  TransactionStatus,
  TransactionTypeEnum,
} from "@/constants";
import z from "zod";
import { PaginationMetaSchema, PaginationQuerySchema } from "./common.model";

export const WalletSchema = z.object({
  id: z.string(),
  balance: z.number().min(0),
  userId: z.string(),
  pendingBalance: z.number().min(0),
});

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  remainingBalance: z.number(),
  description: z.string().nullable(),
  transactionType: z.enum(TransactionTypeEnum),
  transactionMethod: z.enum(TransactionMethod),
  transactionStatus: z.enum(TransactionStatus),
  walledId: z.string(),
  orderCode: z.string().nullable(),
  encryptedAccountName: z.string().nullable(),
  encryptedBankName: z.string().nullable(),
  encryptedBankNumber: z.string().nullable(),
  userNotes: z.string().nullable(),
  isInquiry: z.boolean().default(false),
  withdrawalApprovalImageUrl: z.string().nullable(),
  lastUpdatedAt: z.string(),
  createdAt: z.string(),
});

//QUERIES
export const GetTransactionQuerySchema = PaginationQuerySchema;

// GET
// GET USER WALLET
export const GetUserWalletResSchema = z.object({
  data: WalletSchema.pick({ balance: true, pendingBalance: true }).extend({
    totalEarned: z.number().min(0),
    totalSpent: z.number().min(0),
    totalWithdrawn: z.number().min(0),
  }),
  message: z.string(),
});

// GET USER TRANSACTIONS
export const UserTransactionItemSchema = TransactionSchema.pick({
  id: true,
  amount: true,
  remainingBalance: true,
  description: true,
  transactionType: true,
  transactionMethod: true,
  transactionStatus: true,
  createdAt: true,
});

export const GetUserTransactionsResSchema = z.object({
  data: z.object({
    items: z.array(UserTransactionItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// GET ADMIN TRANSACTIONS
export const AdminTransactionItemSchema = UserTransactionItemSchema;

export const GetAdminTransactionsResSchema = z.object({
  data: z.object({
    items: z.array(AdminTransactionItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// POST
// WITHDRAWAL REQUEST

// WITHDRAWAL CONFIRM

//types:
export type WalletType = z.infer<typeof WalletSchema>;
export type TransactionType = z.infer<typeof TransactionSchema>;
export type GetTransactionQueryType = z.infer<typeof GetTransactionQuerySchema>;
export type GetUserWalletResType = z.infer<typeof GetUserWalletResSchema>;
export type UserTransactionItemType = z.infer<typeof UserTransactionItemSchema>;
export type GetUserTransactionsResType = z.infer<
  typeof GetUserTransactionsResSchema
>;
export type AdminTransactionItemType = z.infer<
  typeof AdminTransactionItemSchema
>;
export type GetAdminTransactionsResType = z.infer<
  typeof GetAdminTransactionsResSchema
>;
