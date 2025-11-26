"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardApiRequest } from "@/lib/apis";
import { DashboardOverviewQueryType } from "@/models";

type DashboardOverviewQueryResponse = Awaited<
  ReturnType<typeof dashboardApiRequest.getOverview>
>;

type UseDashboardOverviewQueryOptions = {
  enabled?: boolean;
  params?: DashboardOverviewQueryType;
};

export const useDashboardOverviewQuery = ({
  enabled = true,
  params,
}: UseDashboardOverviewQueryOptions = {}) => {
  return useQuery<DashboardOverviewQueryResponse>({
    queryKey: ["dashboard-overview", params ?? null],
    queryFn: () => dashboardApiRequest.getOverview(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};
