import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { transactionApiRequest } from "@/lib/apis";
import {
  CreateAccountBankBodyType,
  CreateInquiryTransactionBodyType,
  GetTransactionQueryType,
  UpdateInquiryTransactionBodyType,
  WithdrawalApproveBodyType,
  WithdrawalCancelBodyType,
  WithdrawalConfirmBodyType,
  WithdrawalRequestBodyType,
} from "@/models";

// ===== USER WALLET =====
type UserWalletQueryResponse = Awaited<
  ReturnType<typeof transactionApiRequest.getUserWallet>
>;

type UseUserWalletQueryOptions = {
  enabled?: boolean;
};

export const useUserWallet = ({
  enabled = true,
}: UseUserWalletQueryOptions = {}) => {
  return useQuery<UserWalletQueryResponse>({
    queryKey: ["user-wallet"],
    queryFn: () => transactionApiRequest.getUserWallet(),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// ===== USER TRANSACTIONS =====
type UserTransactionsQueryResponse = Awaited<
  ReturnType<typeof transactionApiRequest.getUserTransactions>
>;

type UseUserTransactionsQueryOptions = {
  enabled?: boolean;
  params?: GetTransactionQueryType;
};

export const useUserTransactions = ({
  enabled = true,
  params,
}: UseUserTransactionsQueryOptions = {}) => {
  return useQuery<UserTransactionsQueryResponse>({
    queryKey: ["user-transactions", params ?? null],
    queryFn: () => transactionApiRequest.getUserTransactions(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// ===== ADMIN TRANSACTIONS =====
type AdminTransactionsQueryResponse = Awaited<
  ReturnType<typeof transactionApiRequest.getAdminTransactions>
>;

type UseAdminTransactionsQueryOptions = {
  enabled?: boolean;
  params?: GetTransactionQueryType;
};

export const useAdminTransactions = ({
  enabled = true,
  params,
}: UseAdminTransactionsQueryOptions = {}) => {
  return useQuery<AdminTransactionsQueryResponse>({
    queryKey: ["admin-transactions", params ?? null],
    queryFn: () => transactionApiRequest.getAdminTransactions(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// ===== CREATE ACCOUNT BANK =====
type CreateAccountBankResponse = Awaited<
  ReturnType<typeof transactionApiRequest.createAccountBank>
>;

export const useCreateAccountBank = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAccountBankResponse,
    Error,
    CreateAccountBankBodyType
  >({
    mutationFn: (body: CreateAccountBankBodyType) =>
      transactionApiRequest.createAccountBank(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallet"] });
    },
  });
};

// ===== DELETE ACCOUNT BANK =====
type DeleteAccountBankResponse = Awaited<
  ReturnType<typeof transactionApiRequest.deleteAccountBank>
>;

export const useDeleteAccountBank = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteAccountBankResponse, Error, string>({
    mutationFn: (bankAccountId: string) =>
      transactionApiRequest.deleteAccountBank(bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallet"] });
    },
  });
};

// ===== WITHDRAWAL REQUEST =====
type WithdrawalRequestResponse = Awaited<
  ReturnType<typeof transactionApiRequest.withdrawalRequest>
>;

export const useWithdrawalRequest = () => {
  return useMutation<
    WithdrawalRequestResponse,
    Error,
    WithdrawalRequestBodyType
  >({
    mutationFn: (body: WithdrawalRequestBodyType) =>
      transactionApiRequest.withdrawalRequest(body),
  });
};

// ===== WITHDRAWAL CONFIRM =====
type WithdrawalConfirmResponse = Awaited<
  ReturnType<typeof transactionApiRequest.withdrawalConfirm>
>;

export const useWithdrawalConfirm = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WithdrawalConfirmResponse,
    Error,
    WithdrawalConfirmBodyType
  >({
    mutationFn: (body: WithdrawalConfirmBodyType) =>
      transactionApiRequest.withdrawalConfirm(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
    },
  });
};

// ===== WITHDRAWAL CANCEL =====
type WithdrawalCancelResponse = Awaited<
  ReturnType<typeof transactionApiRequest.withdrawalCancel>
>;

export const useWithdrawalCancel = () => {
  const queryClient = useQueryClient();

  return useMutation<WithdrawalCancelResponse, Error, WithdrawalCancelBodyType>(
    {
      mutationFn: (body: WithdrawalCancelBodyType) =>
        transactionApiRequest.withdrawalCancel(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      },
    }
  );
};

// ===== WITHDRAWAL APPROVE =====
type WithdrawalApproveResponse = Awaited<
  ReturnType<typeof transactionApiRequest.withdrawalApprove>
>;

export const useWithdrawalApprove = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WithdrawalApproveResponse,
    Error,
    WithdrawalApproveBodyType
  >({
    mutationFn: (body: WithdrawalApproveBodyType) =>
      transactionApiRequest.withdrawalApprove(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });
};

// ===== INQUIRY TRANSACTION =====
type InquiryTransactionParams = {
  id: string;
  body: CreateInquiryTransactionBodyType;
};

type InquiryTransactionResponse = Awaited<
  ReturnType<typeof transactionApiRequest.inquiryTransaction>
>;

export const useInquiryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    InquiryTransactionResponse,
    Error,
    InquiryTransactionParams
  >({
    mutationFn: ({ id, body }: InquiryTransactionParams) =>
      transactionApiRequest.inquiryTransaction(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });
};

// ===== UPDATE INQUIRY TRANSACTION =====
type UpdateInquiryTransactionParams = {
  id: string;
  body: UpdateInquiryTransactionBodyType;
};

type UpdateInquiryTransactionResponse = Awaited<
  ReturnType<typeof transactionApiRequest.updateInquiryTransaction>
>;

export const useUpdateInquiryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateInquiryTransactionResponse,
    Error,
    UpdateInquiryTransactionParams
  >({
    mutationFn: ({ id, body }: UpdateInquiryTransactionParams) =>
      transactionApiRequest.updateInquiryTransaction(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });
};
