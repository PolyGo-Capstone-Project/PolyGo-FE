import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { transactionApiRequest } from "@/lib/apis";
import { GetTransactionQueryType } from "@/models";

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
