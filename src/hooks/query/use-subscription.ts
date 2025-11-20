import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { subscriptionApiRequest } from "@/lib/apis";
import {
  CancelSubscriptionBodyType,
  CreateSubscriptionBodyType,
  PaginationLangQueryType,
  SubscribeBodyType,
  UpdateAutoRenewBodyType,
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

const subscriptionsQueryKey = (params?: PaginationLangQueryType | null) => [
  "subscriptions",
  params ?? null,
];

const subscriptionPlansQueryKey = (params?: PaginationLangQueryType | null) => [
  "subscription-plans",
  params ?? null,
];

const currentSubscriptionQueryKey = (
  params?: PaginationLangQueryType | null
) => ["current-subscription", params ?? null];

const subscriptionUsageQueryKey = (params?: PaginationLangQueryType | null) => [
  "subscription-usage",
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

// ==================== User APIs ====================

type SubscriptionPlansQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getPlan>
>;

type UseUserSubscriptionsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useSubscriptionPlansQuery = ({
  enabled = true,
  params,
}: UseUserSubscriptionsQueryOptions = {}) => {
  return useQuery<SubscriptionPlansQueryResponse>({
    queryKey: subscriptionPlansQueryKey(params ?? null),
    queryFn: () => subscriptionApiRequest.getPlan(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type CurrentSubscriptionQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getCurrent>
>;

export const useCurrentSubscriptionQuery = ({
  enabled = true,
  params,
}: UseUserSubscriptionsQueryOptions = {}) => {
  return useQuery<CurrentSubscriptionQueryResponse>({
    queryKey: currentSubscriptionQueryKey(params ?? null),
    queryFn: () => subscriptionApiRequest.getCurrent(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type SubscriptionUsageQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getUsage>
>;

export const useSubscriptionUsageQuery = ({
  enabled = true,
  params,
}: UseUserSubscriptionsQueryOptions = {}) => {
  return useQuery<SubscriptionUsageQueryResponse>({
    queryKey: subscriptionUsageQueryKey(params ?? null),
    queryFn: () => subscriptionApiRequest.getUsage(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type SubscribeMutationResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.subscribe>
>;

export const useSubscribeMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: SubscribeMutationResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubscribeBodyType) =>
      subscriptionApiRequest.subscribe(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionPlansQueryKey(params ?? null),
      });
      queryClient.invalidateQueries({
        queryKey: currentSubscriptionQueryKey(params ?? null),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionUsageQueryKey(params ?? null),
      });
      options?.onSuccess?.(data);
    },
  });
};

type CancelSubscriptionResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.cancel>
>;

export const useCancelSubscriptionMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: CancelSubscriptionResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CancelSubscriptionBodyType) =>
      subscriptionApiRequest.cancel(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: currentSubscriptionQueryKey(params ?? null),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionUsageQueryKey(params ?? null),
      });
      options?.onSuccess?.(data);
    },
  });
};

type UpdateAutoRenewResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.updateAutoRenew>
>;

export const useUpdateAutoRenewMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: UpdateAutoRenewResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAutoRenewBodyType) =>
      subscriptionApiRequest.updateAutoRenew(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: currentSubscriptionQueryKey(params ?? null),
      });
      options?.onSuccess?.(data);
    },
  });
};
