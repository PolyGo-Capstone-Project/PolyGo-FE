// src/hooks/query/use-subscriptions.ts
import subscriptionApiRequest from "@/lib/apis/subscriptionPlan";
import {
  GetPlansQueryType,
  GetSubscriptionUsageQueryType,
} from "@/models/subscriptionPlan.model";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"; // <-- BỔ SUNG

type PlansQueryResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getAll>
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
    queryFn: () => subscriptionApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* =========================
        NEW HOOKS
========================= */

type CurrentSubscriptionResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getCurrent>
>;

export const useCurrentSubscriptionQuery = (enabled = true) => {
  return useQuery<CurrentSubscriptionResponse>({
    queryKey: ["user-subscription-current"],
    queryFn: () => subscriptionApiRequest.getCurrent(),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UsageResponse = Awaited<
  ReturnType<typeof subscriptionApiRequest.getUsage>
>;

export const useSubscriptionUsageQuery = (
  params: GetSubscriptionUsageQueryType = { pageNumber: 1, pageSize: 10 },
  enabled = true
) => {
  return useQuery<UsageResponse>({
    queryKey: ["user-subscription-usage", params],
    queryFn: () => subscriptionApiRequest.getUsage(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// NEW: toggle auto-renew mutation
export const useToggleAutoRenewMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (autoRenew: boolean) =>
      subscriptionApiRequest.toggleAutoRenew(autoRenew),
    onSuccess: () => {
      // refetch current subscription để đồng bộ trạng thái
      qc.invalidateQueries({ queryKey: ["user-subscription-current"] });
    },
  });
};
