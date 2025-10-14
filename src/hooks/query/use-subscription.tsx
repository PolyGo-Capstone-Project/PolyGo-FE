import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { subscriptionApiRequest } from "@/lib/apis";
import {
  CreateSubscriptionBodyType,
  PaginationLangQueryType,
  UpdateSubscriptionBodyType,
} from "@/models";

type SubscriptionsQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getAll>
>;

type SubscriptionQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getOne>
>;

type UseSubscriptionsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useSubscriptionsQuery = ({
  enabled = true,
  params,
}: UseSubscriptionsQueryOptions = {}) => {
  return useQuery<SubscriptionsQueryResponse>({
    queryKey: ["subscriptions", params ?? null],
    queryFn: () => subscriptionApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseSubscriptionQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useSubscriptionQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseSubscriptionQueryOptions = {}) => {
  return useQuery<SubscriptionQueryResponse>({
    queryKey: ["subscription", id ?? null, lang ?? null],
    queryFn: () => subscriptionApiRequest.getOne(id as string, { lang }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

type UseUserSubscriptionsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

const subscriptionsQueryKey = (params?: PaginationLangQueryType | null) => [
  "subscriptions",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof subscriptionApiRequest.create>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey(params) });
  };
};

export const useCreateSubscriptionMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubscriptionBodyType) =>
      subscriptionApiRequest.create(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useUpdateSubscriptionMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateSubscriptionBodyType;
    }) => subscriptionApiRequest.update(id, body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.invalidateQueries({
        queryKey: ["subscription", variables.id, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

export const useDeleteSubscriptionMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionApiRequest.delete(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["subscription", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
