// src/hooks/query/use-subscriptions.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import subscriptionApiRequest, {
  subscriptionPlansApiRequest,
} from "@/lib/apis/subscription";

import {
  CreateSubscriptionBodyType,
  // Types cho phần Plans/Current/Usage/Subscribe
  GetPlansQueryType,
  GetSubscriptionUsageQueryType,
  PaginationLangQueryType,
  SubscribeBodyType,
  UpdateSubscriptionBodyType,
} from "@/models";

/* =========================
      ADMIN: Subscriptions
   (giữ nguyên logic)
========================= */

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
    onSuccess: (data) => {
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
    onSuccess: (data, variables) => {
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
    onSuccess: (data, variables) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["subscription", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

/* =========================
   PUBLIC: Plans / Current / Usage
   (giữ nguyên logic)
========================= */

type PlansQueryResponse = Awaited<
  ReturnType<typeof subscriptionPlansApiRequest.getAll>
>;

type UsePlansQueryOptions = {
  enabled?: boolean;
  params?: GetPlansQueryType;
};

export const usePlansQuery = ({
  enabled = true,
  params,
}: UsePlansQueryOptions = {}) => {
  return useQuery<PlansQueryResponse>({
    queryKey: ["plans", params ?? null],
    queryFn: () => subscriptionPlansApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* = Current subscription = */
type CurrentSubscriptionResponse = Awaited<
  ReturnType<typeof subscriptionPlansApiRequest.getCurrent>
>;

export const useCurrentSubscriptionQuery = (enabled = true) => {
  return useQuery<CurrentSubscriptionResponse>({
    queryKey: ["user-subscription-current"],
    queryFn: () => subscriptionPlansApiRequest.getCurrent(),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* = Usage of current = */
type UsageResponse = Awaited<
  ReturnType<typeof subscriptionPlansApiRequest.getUsage>
>;

export const useSubscriptionUsageQuery = (
  params: GetSubscriptionUsageQueryType = { pageNumber: 1, pageSize: 10 },
  enabled = true
) => {
  return useQuery<UsageResponse>({
    queryKey: ["user-subscription-usage", params],
    queryFn: () => subscriptionPlansApiRequest.getUsage(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* = Toggle auto-renew = */
export const useToggleAutoRenewMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (autoRenew: boolean) =>
      subscriptionPlansApiRequest.toggleAutoRenew(autoRenew),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-subscription-current"] });
    },
  });
};

/* = Cancel current subscription = */
export const useCancelSubscriptionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      subscriptionPlansApiRequest.cancelCurrent(reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-subscription-current"] });
      qc.invalidateQueries({ queryKey: ["user-subscription-usage"] });
    },
  });
};

/* = Subscribe to a plan = */
export const useSubscribeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubscribeBodyType) =>
      subscriptionPlansApiRequest.subscribe(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-subscription-current"] });
      qc.invalidateQueries({ queryKey: ["user-subscription-usage"] });
    },
  });
};
