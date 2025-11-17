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
  totalEarned: z.number().min(0),
  totalSpent: z.number().min(0),
  totalWithdrawn: z.number().min(0),
});

export const WalletBankAccountSchema = z.object({
  id: z.string(),
  bankName: z.string(),
  encryptedBankName: z.string(),
  encryptedBankNumber: z.string(),
  walletId: z.string(),
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
export const GetTransactionAdminQuerySchema = PaginationQuerySchema.extend({
  description: z.string().min(1).max(100).optional(),
  isInquiry: z.boolean().optional(),
  transactionType: z.enum(TransactionTypeEnum).optional(),
  transactionMethod: z.enum(TransactionMethod).optional(),
  transactionStatus: z.enum(TransactionStatus).optional(),
});

// GET
// GET USER WALLET
const accountBank = z.object({
  bankName: z.string(),
  bankNumber: z.string(),
  accountName: z.string(),
});
export const GetUserWalletResSchema = z.object({
  data: WalletSchema.extend({
    accounts: z.array(accountBank),
    numberOfAccounts: z.number().min(0).max(2).optional(),
  }),
  message: z.string(),
});

// GET USER TRANSACTIONS
export const UserTransactionItemSchema = TransactionSchema.pick({
  id: true,
  amount: true,
  remainingBalance: true,
  description: true,
  userNotes: true,
  isInquiry: true,
  transactionType: true,
  transactionMethod: true,
  transactionStatus: true,
  createdAt: true,
  lastUpdatedAt: true,
}).extend({
  bankName: z.string().nullable().optional(),
  bankNumber: z.string().nullable().optional(),
  accountName: z.string().nullable().optional(),
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
// Create account bank
export const CreateAccountBankBodySchema = z
  .object({
    bankName: z.string(),
    bankNumber: z.string(),
    accountName: z.string(),
  })
  .strict();

// WITHDRAWAL REQUEST
export const WithdrawalRequestBodySchema = z
  .object({
    amount: z.number().min(10000).max(10000000),
    bankNumber: z.string(),
    bankName: z.string(),
    accountName: z.string(),
  })
  .strict();

// WITHDRAWAL CONFIRM
export const WithdrawalConfirmBodySchema = z
  .object({
    otp: z.string().length(6),
  })
  .strict();

// inquiry transaction
export const CreateInquiryTransactionBodySchema = z
  .object({
    userNotes: z.string().optional(),
  })
  .strict();

// PUT
// Withdrawal cancel
export const WithdrawalCancelBodySchema = z
  .object({
    systemNotes: z.string().optional(),
  })
  .strict();

// Withdrawal approve
export const WithdrawalApproveBodySchema = z
  .object({
    withdrawalApprovedImageUrl: z.string().optional(),
  })
  .strict();

// inquiry
export const UpdateInquiryTransactionBodySchema =
  CreateInquiryTransactionBodySchema;

//types:
export type WalletType = z.infer<typeof WalletSchema>;
export type WalletBankAccountType = z.infer<typeof WalletBankAccountSchema>;
export type TransactionType = z.infer<typeof TransactionSchema>;
export type GetTransactionQueryType = z.infer<typeof GetTransactionQuerySchema>;
export type GetTransactionAdminQueryType = z.infer<
  typeof GetTransactionAdminQuerySchema
>;

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
export type CreateAccountBankBodyType = z.infer<
  typeof CreateAccountBankBodySchema
>;
export type WithdrawalRequestBodyType = z.infer<
  typeof WithdrawalRequestBodySchema
>;
export type WithdrawalConfirmBodyType = z.infer<
  typeof WithdrawalConfirmBodySchema
>;
export type WithdrawalCancelBodyType = z.infer<
  typeof WithdrawalCancelBodySchema
>;
export type WithdrawalApproveBodyType = z.infer<
  typeof WithdrawalApproveBodySchema
>;
export type CreateInquiryTransactionBodyType = z.infer<
  typeof CreateInquiryTransactionBodySchema
>;
export type UpdateInquiryTransactionBodyType = z.infer<
  typeof UpdateInquiryTransactionBodySchema
>;
