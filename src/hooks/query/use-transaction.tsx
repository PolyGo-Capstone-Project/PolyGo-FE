import { transactionApiRequest } from "@/lib/apis";
import { PaginationLangQueryType } from "@/models";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type TransactionsQueryResponse = Awaited<
  ReturnType<typeof transactionApiRequest.getAll>
>;

type TransactionBalanceQueryResponse = Awaited<
  ReturnType<typeof transactionApiRequest.getMyBalance>
>;

type UseTransactionQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useTransactionQuery = ({
  enabled = true,
  params,
}: UseTransactionQueryOptions = {}) => {
  return useQuery<TransactionsQueryResponse>({
    queryKey: ["transactions", params ?? null],
    queryFn: () => transactionApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseTransactionBalanceQueryOptions = {
  enabled?: boolean;
};

export const useTransactionBalanceQuery = ({
  enabled = true,
}: UseTransactionBalanceQueryOptions = {}) => {
  return useQuery<TransactionBalanceQueryResponse>({
    queryKey: ["transaction", "balance"],
    queryFn: () => transactionApiRequest.getMyBalance(),
    enabled,
    placeholderData: keepPreviousData,
  });
};
