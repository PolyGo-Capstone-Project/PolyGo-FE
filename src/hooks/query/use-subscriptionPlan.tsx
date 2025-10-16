// src/hooks/query/use-subscriptions.ts
import subscriptionApiRequest from "@/lib/apis/subscription";
import { GetPlansQueryType } from "@/models/subscriptionPlan.model";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
